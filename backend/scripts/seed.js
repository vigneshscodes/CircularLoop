import dotenv from "dotenv";
import { getDriver, closeDriver } from "../config/db.js";
dotenv.config();

const categories=[
  {id:"cat-computing",name:"Computing"},{id:"cat-mobile",name:"Mobile Devices"},
  {id:"cat-entertainment",name:"Home Entertainment"},{id:"cat-appliance",name:"Home Appliances"},
  {id:"cat-audio",name:"Audio"}
];
const materials=[
  ["mat-lithium","Lithium","Specialist recovery","High"],["mat-copper","Copper","Highly recyclable","High"],
  ["mat-aluminium","Aluminium","Highly recyclable","High"],["mat-steel","Steel","Highly recyclable","Medium"],
  ["mat-plastic","Plastic","Depends on polymer","Low"],["mat-glass","Glass","Recyclable","Medium"],
  ["mat-gold","Gold","Recoverable from circuit boards","High"],["mat-cobalt","Cobalt","Specialist recovery","High"],
  ["mat-nickel","Nickel","Recyclable","Medium"],["mat-silicon","Silicon","Specialist processing","Medium"]
].map(([id,name,recyclability,environmental_value])=>({id,name,recyclability,environmental_value}));
const components=[
  ["comp-battery","Lithium-ion battery","varies",true,["mat-lithium","mat-cobalt","mat-nickel"]],
  ["comp-lcd","LCD display","varies",false,["mat-glass","mat-aluminium"]],
  ["comp-motherboard","Motherboard","varies",true,["mat-gold","mat-copper","mat-silicon"]],
  ["comp-ram","RAM module","often reusable",true,["mat-gold","mat-silicon"]],
  ["comp-ssd","SSD","often reusable",true,["mat-silicon","mat-aluminium"]],
  ["comp-fan","Cooling fan","often reusable",true,["mat-plastic","mat-copper"]],
  ["comp-wiring","Copper wiring","varies",true,["mat-copper","mat-plastic"]],
  ["comp-speaker","Speaker","varies",true,["mat-copper","mat-steel"]],
  ["comp-psu","Power supply","varies",true,["mat-copper","mat-aluminium"]],
  ["comp-port","Charging port","varies",true,["mat-copper","mat-plastic"]],
  ["comp-circuit","Circuit board","varies",true,["mat-gold","mat-copper","mat-silicon"]],
  ["comp-casing","Plastic casing","varies",false,["mat-plastic"]],
  ["comp-compressor","Compressor","varies",true,["mat-steel","mat-copper"]],
  ["comp-motor","Electric motor","varies",true,["mat-steel","mat-copper"]],
  ["comp-frame","Metal frame","varies",true,["mat-aluminium","mat-steel"]],
  ["comp-camera","Camera module","varies",true,["mat-glass","mat-silicon","mat-copper"]],
  ["comp-antenna","Wireless antenna","varies",true,["mat-copper","mat-plastic"]]
].map(([id,name,condition,reusable,materials])=>({id,name,condition,reusable,materials}));
const actions=[
  ["act-repair","Repair","Diagnose and fix a fault while retaining the device.","Moderate","INR 800-2500","High"],
  ["act-replace","Component Replacement","Replace a failed component with a compatible part.","Moderate","INR 1200-4500","High"],
  ["act-reuse","Component Reuse","Test and reuse functional components in another device.","Moderate","INR 0-800","High"],
  ["act-refurbish","Refurbishment","Clean, test and restore a device for another user.","Moderate","INR 1500-5000","High"],
  ["act-recovery","Material Recovery","Recover metals and materials through specialist processing.","Hard","INR 300-1200","High"],
  ["act-battery","Battery Recycling","Send battery packs to a qualified battery recycler.","Hard","INR 100-500","High"],
  ["act-ewaste","E-waste Recycling","Route unusable electronics to an authorized recycling stream.","Easy","INR 0-300","High"],
  ["act-disposal","Safe Disposal","Isolate hazardous parts and use an approved disposal route.","Moderate","INR 0-400","Medium"],
  ["act-salvage","Parts Salvaging","Remove and test reusable parts before recycling the remainder.","Moderate","INR 200-900","High"],
  ["act-donate","Donation","Pass a working or refurbished device to a suitable recipient.","Easy","INR 0-500","High"]
].map(([id,name,description,difficulty,estimated_cost,impact])=>({id,name,description,difficulty,estimated_cost,impact}));
const facilities=[
  ["fac-fix","Campus Repair Workshop","Repair Centre","Vellore (sample)","Demonstration facility for basic device inspection and repair."],
  ["fac-refurb","Community Refurbishment Hub","Reuse Centre","Chennai (sample)","Demonstration facility for testing and refurbishing usable devices."],
  ["fac-battery","Battery Recovery Unit","Battery Recycler","Coimbatore (sample)","Sample specialist destination for safe battery handling."],
  ["fac-ewaste","Circular E-waste Centre","E-waste Recycler","Vellore (sample)","Demonstration collection and sorting point for e-waste."],
  ["fac-material","Materials Recovery Lab","Materials Recovery","Bengaluru (sample)","Sample facility for separating recoverable metals and materials."]
].map(([id,name,type,location,description])=>({id,name,type,location,description}));
const items=[
  ["item-laptop","Laptop","Computing","Aster","damaged","Portable computer with replaceable storage, memory and battery." ,["comp-battery","comp-lcd","comp-motherboard","comp-ram","comp-ssd","comp-fan","comp-casing"],["act-repair","act-replace","act-refurbish","act-reuse","act-salvage","act-ewaste"]],
  ["item-phone","Smartphone","Mobile Devices","Nova","poor","Touchscreen phone with compact battery, camera and circuit assemblies.",["comp-battery","comp-lcd","comp-circuit","comp-port","comp-camera","comp-antenna"],["act-repair","act-replace","act-battery","act-salvage","act-ewaste"]],
  ["item-tablet","Tablet","Mobile Devices","Aster","damaged","Portable touchscreen device with integrated electronics.",["comp-battery","comp-lcd","comp-circuit","comp-camera","comp-speaker"],["act-repair","act-replace","act-refurbish","act-battery","act-ewaste"]],
  ["item-desktop","Desktop Computer","Computing","CoreWorks","working","Modular computer with reusable memory, storage and power components.",["comp-motherboard","comp-ram","comp-ssd","comp-fan","comp-psu","comp-wiring","comp-frame"],["act-refurbish","act-donate","act-reuse","act-salvage","act-ewaste"]],
  ["item-tv","Television","Home Entertainment","ViewMax","poor","Large display device with circuit boards, speakers and metal frame.",["comp-lcd","comp-circuit","comp-speaker","comp-wiring","comp-frame"],["act-repair","act-salvage","act-recovery","act-ewaste"]],
  ["item-washer","Washing Machine","Home Appliances","HomeSpring","damaged","Household appliance containing a motor, wiring and steel structure.",["comp-motor","comp-wiring","comp-circuit","comp-frame"],["act-repair","act-replace","act-salvage","act-recovery","act-ewaste"]],
  ["item-fridge","Refrigerator","Home Appliances","FrostLine","non-functional","Cooling appliance with compressor, wiring and metal enclosure.",["comp-compressor","comp-wiring","comp-circuit","comp-frame"],["act-repair","act-salvage","act-recovery","act-disposal","act-ewaste"]],
  ["item-headphones","Wireless Headphones","Audio","SonicLoop","poor","Rechargeable audio device with small battery, speakers and wireless electronics.",["comp-battery","comp-speaker","comp-circuit","comp-port","comp-casing"],["act-repair","act-battery","act-salvage","act-ewaste"]]
].map(([id,name,category,brand,condition,description,components,actions])=>({id,name,category,brand,condition,description,components,actions}));
const rels=[
  ["act-repair","act-refurbish"],["act-replace","act-refurbish"],["act-salvage","act-reuse"],
  ["act-salvage","act-recovery"],["act-battery","act-recovery"],["act-recovery","act-ewaste"],
  ["act-refurbish","act-donate"],["act-repair","act-donate"],["act-reuse","act-ewaste"]
];
const facilityMap={
  "act-repair":["fac-fix"],"act-replace":["fac-fix"],"act-refurbish":["fac-refurb"],
  "act-reuse":["fac-refurb"],"act-donate":["fac-refurb"],"act-battery":["fac-battery"],
  "act-recovery":["fac-material"],"act-ewaste":["fac-ewaste"],"act-disposal":["fac-ewaste"],
  "act-salvage":["fac-fix","fac-material"]
};

try {
  const driver=getDriver(); await driver.verifyConnectivity();
  const session=driver.session({database:process.env.NEO4J_DATABASE||"neo4j"});
  try {
    await session.executeWrite(async tx=>{
      for(const c of categories) await tx.run("MERGE (n:Category {id:$id}) SET n.name=$name",c);
      for(const m of materials) await tx.run("MERGE (n:Material {id:$id}) SET n += $props",{id:m.id,props:m});
      for(const c of components) {
        await tx.run("MERGE (n:Component {id:$id}) SET n.name=$name,n.condition=$condition,n.reusable=$reusable",{...c});
        for(const mid of c.materials) await tx.run("MATCH (c:Component {id:$cid}),(m:Material {id:$mid}) MERGE (c)-[:MADE_OF]->(m)",{cid:c.id,mid});
      }
      for(const a of actions) await tx.run("MERGE (n:Action {id:$id}) SET n.name=$name,n.description=$description,n.difficulty=$difficulty,n.estimated_cost=$estimated_cost,n.impact=$impact,n.custom=false",a);
      for(const f of facilities) await tx.run("MERGE (n:Facility {id:$id}) SET n.name=$name,n.type=$type,n.location=$location,n.description=$description",f);
      for(const item of items) {
        const {components:comps,actions:acts,category,...props}=item;
        await tx.run("MERGE (i:Item {id:$id}) SET i += $props",{id:item.id,props});
        await tx.run("MATCH (i:Item {id:$id}),(c:Category {name:$category}) MERGE (i)-[:BELONGS_TO]->(c)",{id:item.id,category});
        for(const cid of comps) await tx.run("MATCH (i:Item {id:$iid}),(c:Component {id:$cid}) MERGE (i)-[:CONTAINS]->(c)",{iid:item.id,cid});
        for(const aid of acts) await tx.run("MATCH (i:Item {id:$iid}),(a:Action {id:$aid}) MERGE (i)-[:ELIGIBLE_FOR]->(a)",{iid:item.id,aid});
      }
      for(const [from,to] of rels) await tx.run("MATCH (a:Action {id:$from}),(b:Action {id:$to}) MERGE (a)-[:LEADS_TO]->(b)",{from,to});
      for(const [aid,fids] of Object.entries(facilityMap)) for(const fid of fids) await tx.run("MATCH (a:Action {id:$aid}),(f:Facility {id:$fid}) MERGE (a)-[:AVAILABLE_AT]->(f)",{aid,fid});
      const reuse=[["comp-ram","comp-ssd"],["comp-speaker","comp-speaker"],["comp-motherboard","comp-circuit"],["comp-fan","comp-fan"],["comp-camera","comp-camera"]];
      for(const [from,to] of reuse) await tx.run("MATCH (a:Component {id:$from}),(b:Component {id:$to}) MERGE (a)-[:CAN_BE_REUSED_AS]->(b)",{from,to});
    });
  } finally { await session.close(); }
  console.log(`Seed complete: ${items.length} items, ${components.length} components, ${materials.length} materials, ${actions.length} actions, ${facilities.length} facilities.`);
} catch(error) { console.error("Seed failed:",error.message); process.exitCode=1; }
finally { await closeDriver(); }
