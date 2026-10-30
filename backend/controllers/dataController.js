import { readQuery, writeQuery, getDriver } from "../config/db.js";
import { recordObject, asyncHandler, validId } from "../utils/format.js";

const rows = result => result.records.map(recordObject);
const fail = (message,status=400) => Object.assign(new Error(message),{status});

export const health = asyncHandler(async (req,res) => {
  let database = "disconnected";
  try { await getDriver().verifyConnectivity(); database = "connected"; }
  catch (e) { return res.status(503).json({ success:false, backend:"ok", database, message:e.message }); }
  res.json({ success:true, backend:"ok", database });
});

export const dashboard = asyncHandler(async (req,res) => {
  const result = await readQuery(`
    CALL {
      MATCH (n:Item) RETURN count(n) AS items
    }
    CALL {
      MATCH (n:Action) RETURN count(n) AS actions
    }
    CALL {
      MATCH (n:Component) RETURN count(n) AS components
    }
    CALL {
      MATCH (n:Material) RETURN count(n) AS materials
    }
    RETURN items, actions, components, materials
  `);
  res.json({success:true, stats: rows(result)[0]});
});

export const getItems = asyncHandler(async (req,res) => {
  const { search = "", category = "" } = req.query;
  const result = await readQuery(`
    MATCH (i:Item)-[:BELONGS_TO]->(c:Category)
    WHERE toLower(i.name) CONTAINS toLower($search)
      AND ($category = "" OR c.name = $category)
    RETURN i { .* } AS item, c.name AS category
    ORDER BY i.name
  `,{search:String(search).slice(0,80),category:String(category).slice(0,80)});
  res.json({success:true, items:rows(result).map(r=>({...r.item,category:r.category}))});
});

export const getItem = asyncHandler(async (req,res) => {
  const result = await readQuery(`
    MATCH (i:Item {id:$id})-[:BELONGS_TO]->(c:Category)
    OPTIONAL MATCH (i)-[:CONTAINS]->(comp:Component)-[:MADE_OF]->(m:Material)
    WITH i,c,comp,m
    OPTIONAL MATCH (i)-[:ELIGIBLE_FOR]->(a:Action)
    OPTIONAL MATCH (a)-[:AVAILABLE_AT]->(f:Facility)
    RETURN i { .* } AS item, c.name AS category,
      collect(DISTINCT comp { .*, materials: [] }) AS components,
      collect(DISTINCT {id:a.id,name:a.name,description:a.description,difficulty:a.difficulty,
        estimated_cost:a.estimated_cost,impact:a.impact,facility: CASE WHEN f IS NULL THEN null ELSE f { .* } END}) AS actions
  `,{id:req.params.id});
  if (!result.records.length) throw fail("Item not found",404);
  const base=recordObject(result.records[0]);
  const componentResult=await readQuery(`
    MATCH (:Item {id:$id})-[:CONTAINS]->(c:Component)
    OPTIONAL MATCH (c)-[:MADE_OF]->(m:Material)
    RETURN c { .* } AS component, collect(DISTINCT m { .* }) AS materials
    ORDER BY component.name
  `,{id:req.params.id});
  res.json({success:true,item:{...base.item,category:base.category},components:rows(componentResult).map(r=>({...r.component,materials:r.materials})),actions:base.actions.filter(a=>a.id)});
});

export const getComponents = asyncHandler(async (req,res) => {
  const result=await readQuery(`
    MATCH (:Item {id:$id})-[:CONTAINS]->(c:Component)
    OPTIONAL MATCH (c)-[:MADE_OF]->(m:Material)
    RETURN c { .* } AS component, collect(DISTINCT m { .* }) AS materials
    ORDER BY component.name
  `,{id:req.params.id});
  res.json({success:true,components:rows(result).map(r=>({...r.component,materials:r.materials}))});
});

export const getLifecycle = asyncHandler(async (req,res) => {
  const result=await readQuery(`
    MATCH (i:Item {id:$id})-[:ELIGIBLE_FOR]->(a:Action)
    OPTIONAL MATCH (a)-[:AVAILABLE_AT]->(f:Facility)
    OPTIONAL MATCH path=(a)-[:LEADS_TO*0..3]->(next:Action)
    RETURN DISTINCT a { .* } AS action,
      collect(DISTINCT f { .* }) AS facilities,
      collect(DISTINCT next { .* }) AS nextActions
    ORDER BY action.name
  `,{id:req.params.id});
  res.json({success:true,actions:rows(result)});
});

export const recommendations = asyncHandler(async (req,res) => {
  const { itemId, condition }=req.body;
  if (!validId(itemId)) throw fail("A valid itemId is required");
  const allowed=["working","damaged","poor","non-functional","unknown"];
  if (condition && !allowed.includes(condition)) throw fail("Invalid condition value");
  const result=await readQuery(`
    MATCH (i:Item {id:$itemId})-[:ELIGIBLE_FOR]->(a:Action)
    OPTIONAL MATCH (i)-[:CONTAINS]->(c:Component)
    OPTIONAL MATCH (c)-[:MADE_OF]->(m:Material)
    OPTIONAL MATCH (a)-[:AVAILABLE_AT]->(f:Facility)
    OPTIONAL MATCH (a)-[:LEADS_TO*0..3]->(next:Action)
    WITH i,a,collect(DISTINCT c { .* }) AS components,
      collect(DISTINCT m { .* }) AS materials,
      collect(DISTINCT f { .* }) AS facilities,
      collect(DISTINCT next { .* }) AS pathway,
      CASE
        WHEN $condition = 'working' AND a.name IN ['Donation','Refurbishment','Component Reuse'] THEN 1
        WHEN $condition = 'damaged' AND a.name IN ['Repair','Component Replacement','Refurbishment'] THEN 1
        WHEN $condition IN ['poor','non-functional'] AND a.name IN ['Material Recovery','Battery Recycling','E-waste Recycling','Parts Salvaging'] THEN 1
        ELSE 0
      END AS conditionFit
    RETURN a { .* } AS action, conditionFit, components, materials,
      [x IN facilities WHERE x IS NOT NULL] AS facilities,
      [x IN pathway WHERE x IS NOT NULL] AS pathway
    ORDER BY conditionFit DESC,
      CASE a.impact WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 ELSE 1 END DESC,
      a.estimated_cost ASC
  `,{itemId,condition:condition || "unknown"});
  res.json({success:true, basis:"Rule-based recommendations from curated Item, Component, Material and Action relationships. Condition fit is a transparent prioritization rule, not an AI diagnosis.",recommendations:rows(result)});
});

export const graphForItem = asyncHandler(async (req,res) => {
  const result=await readQuery(`
    MATCH (i:Item {id:$id})
    OPTIONAL MATCH p=(i)-[:BELONGS_TO|CONTAINS|MADE_OF|ELIGIBLE_FOR|AVAILABLE_AT|LEADS_TO|CAN_BE_REUSED_AS*1..4]-(n)
    WITH i, collect(DISTINCT p) AS paths
    UNWIND paths AS p
    UNWIND nodes(p) AS node
    WITH collect(DISTINCT node) AS ns, collect(DISTINCT relationships(p)) AS rs
    UNWIND ns AS n
    WITH collect(DISTINCT {id:coalesce(n.id, elementId(n)),label:head(labels(n)),name:coalesce(n.name,'Unknown'),properties:properties(n)}) AS nodes, rs
    UNWIND rs AS relList
    UNWIND relList AS r
    RETURN nodes, collect(DISTINCT {id:elementId(r),source:startNode(r).id,target:endNode(r).id,type:type(r)}) AS links
  `,{id:req.params.id});
  if(!result.records.length) throw fail("Item not found",404);
  const obj=recordObject(result.records[0]);
  res.json({success:true,nodes:obj.nodes,edges:obj.links.filter(e=>e.source&&e.target)});
});

export const getActions = asyncHandler(async (req,res) => {
  const result=await readQuery(`MATCH (a:Action) OPTIONAL MATCH (a)-[:AVAILABLE_AT]->(f:Facility) RETURN a { .* } AS action, collect(DISTINCT f { .* }) AS facilities ORDER BY action.name`);
  res.json({success:true,actions:rows(result)});
});
export const getAction = asyncHandler(async (req,res) => {
  const result=await readQuery(`MATCH (a:Action {id:$id}) OPTIONAL MATCH (a)-[:AVAILABLE_AT]->(f:Facility) RETURN a { .* } AS action, collect(DISTINCT f { .* }) AS facilities`,{id:req.params.id});
  if(!result.records.length) throw fail("Action not found",404);
  res.json({success:true,...recordObject(result.records[0])});
});
const actionInput = body => {
  const fields=["name","description","difficulty","estimated_cost","impact"];
  const out={};
  for(const key of fields) {
    const value=body[key];
    if(typeof value!=="string" || !value.trim() || value.length>500) throw fail(`${key} is required and must be under 500 characters`);
    out[key]=value.trim();
  }
  if(!["Easy","Moderate","Hard"].includes(out.difficulty)) throw fail("difficulty must be Easy, Moderate or Hard");
  if(!["Low","Medium","High"].includes(out.impact)) throw fail("impact must be Low, Medium or High");
  if(!/^[A-Z]{3}\s?\d+.*$/.test(out.estimated_cost) && out.estimated_cost.length>40) throw fail("estimated_cost is too long");
  return out;
};
export const createAction = asyncHandler(async (req,res) => {
  const data=actionInput(req.body);
  const id=`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const result=await writeQuery(`CREATE (a:Action {id:$id,name:$name,description:$description,difficulty:$difficulty,estimated_cost:$estimated_cost,impact:$impact,custom:true}) RETURN a { .* } AS action`,{id,...data});
  res.status(201).json({success:true,action:recordObject(result.records[0]).action});
});
export const updateAction = asyncHandler(async (req,res) => {
  if(!validId(req.params.id)) throw fail("Invalid action id");
  const data=actionInput(req.body);
  const result=await writeQuery(`MATCH (a:Action {id:$id}) SET a += $data RETURN a { .* } AS action`,{id:req.params.id,data});
  if(!result.records.length) throw fail("Action not found",404);
  res.json({success:true,action:recordObject(result.records[0]).action});
});
export const deleteAction = asyncHandler(async (req,res) => {
  if(!validId(req.params.id)) throw fail("Invalid action id");
  const result=await writeQuery(`MATCH (a:Action {id:$id}) WHERE coalesce(a.custom,false)=true WITH a, size([(i:Item)-[:ELIGIBLE_FOR]->(a) | i]) AS itemLinks DETACH DELETE a RETURN itemLinks`,{id:req.params.id});
  if(!result.records.length) throw fail("Action not found or seeded actions are protected from deletion",404);
  res.json({success:true,message:"Custom action and its direct relationships deleted safely."});
});
export const facilities = asyncHandler(async (req,res) => {
  const result=await readQuery(`MATCH (f:Facility) OPTIONAL MATCH (a:Action)-[:AVAILABLE_AT]->(f) RETURN f { .* } AS facility, collect(DISTINCT a.name) AS actions ORDER BY facility.name`);
  res.json({success:true,facilities:rows(result)});
});
