import {useEffect,useMemo,useState} from "react";
import ReactFlow,{Background,Controls,MiniMap,Handle,Position} from "reactflow";
import "reactflow/dist/style.css";
import {PageHeading,Loading,ErrorState,Badge} from "../components/UI";
import api from "../api";
function GraphNode({data}){return <div className={`graph-node node-${data.kind.toLowerCase()}`}><Handle type="target" position={Position.Top}/><small>{data.kind}</small><b>{data.label}</b><Handle type="source" position={Position.Bottom}/></div>}
const nodeTypes={circular:GraphNode};
const palette={Item:"#d8f0df",Category:"#e8f0ff",Component:"#d9f0ed",Material:"#fff1d9",Action:"#e8e1ff",Facility:"#ffe7e5"};
export default function Graph(){
 const [items,setItems]=useState([]),[itemId,setItemId]=useState(""),[graph,setGraph]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 useEffect(()=>{api.get("/items").then(r=>{setItems(r.items);if(r.items[0])setItemId(r.items[0].id);}).catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(!itemId)return;setLoading(true);api.get(`/graph/${itemId}`).then(setGraph).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[itemId]);
 const {nodes,edges}=useMemo(()=>{if(!graph)return {nodes:[],edges:[]};const levels={Item:0,Category:0,Component:1,Material:2,Action:2,Facility:3};const counts={};return {nodes:graph.nodes.map((n,i)=>{const level=levels[n.label]??1;const index=counts[level]||0;counts[level]=index+1;return {id:n.id,type:"circular",position:{x:level*245,y:index*115},data:{label:n.name,kind:n.label}};}),edges:graph.edges.map((e,i)=>({id:e.id||`e${i}`,source:e.source,target:e.target,label:e.type,animated:false,style:{stroke:"#8ab7a0",strokeWidth:1.6},labelStyle:{fontSize:9,fill:"#527568"}})).filter(e=>graph.nodes.some(n=>n.id===e.source)&&graph.nodes.some(n=>n.id===e.target))};},[graph]);
 return <><PageHeading eyebrow="NEO4J VISUAL EXPLORER" title="See the connections" description="Explore real nodes and relationships returned by a multi-hop Cypher traversal."/><div className="graph-toolbar"><label>Focus item<select value={itemId} onChange={e=>setItemId(e.target.value)}>{items.map(i=><option value={i.id} key={i.id}>{i.name}</option>)}</select></label><div className="legend">{Object.entries(palette).map(([k,v])=><span key={k}><i style={{background:v}}/>{k}</span>)}</div><Badge>{nodes.length} nodes · {edges.length} links</Badge></div>{error?<ErrorState message={error}/>:loading?<Loading/>:<div className="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{padding:.2}}><Background color="#e7eee9" gap={20}/><Controls/><MiniMap nodeColor={n=>palette[n.data.kind]||"#ddd"} maskColor="rgba(245,249,246,.65)"/></ReactFlow></div>}<p className="method-note">Each edge represents a stored Neo4j relationship. Select a different item to load its connected subgraph.</p></>
}
