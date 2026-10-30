import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {ArrowLeft,ArrowRight,Layers3,Recycle,MapPin,Leaf} from "lucide-react";
import api from "../api";
import {Loading,ErrorState,PageHeading,Badge,Empty} from "../components/UI";
export default function ItemDetails(){
 const {id}=useParams();const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{api.get(`/items/${id}`).then(setData).catch(e=>setError(e.message));},[id]);
 if(error)return <ErrorState message={error}/>;if(!data)return <Loading/>;
 const {item,components,actions}=data;
 return <><Link to="/explore" className="back-link"><ArrowLeft size={16}/> Back to items</Link><PageHeading eyebrow={item.category.toUpperCase()} title={item.name} description={item.description} action={<Link className="button primary" to={`/recommend?item=${item.id}`}>Find lifecycle options <ArrowRight size={16}/></Link>}/>
 <div className="detail-hero"><div className="detail-symbol"><Layers3 size={34}/></div><div><div className="item-category">{item.brand} · Curated sample item</div><h2>Device overview</h2><p>Condition: <Badge tone="amber">{item.condition}</Badge></p></div><div className="detail-counts"><div><b>{components.length}</b><small>Components</small></div><div><b>{actions.length}</b><small>Linked actions</small></div></div></div>
 <div className="section-heading"><div><h2>Component breakdown</h2><p>Components and the materials connected to each one in Neo4j.</p></div></div>
 <div className="component-grid">{components.map(c=><div className="component-card" key={c.id}><div className="component-head"><b>{c.name}</b><Badge tone={c.reusable?"green":"gray"}>{c.reusable?"Reusable":"Limited reuse"}</Badge></div><small>Condition: {c.condition}</small><div className="material-list">{c.materials.map(m=><span key={m.id}><Leaf size={12}/>{m.name}</span>)}</div></div>)}</div>
 <div className="section-heading"><div><h2>Eligible lifecycle actions</h2><p>Options connected to this item through graph relationships.</p></div></div>
 <div className="action-list">{actions.map(a=><div className="action-row" key={a.id}><div className="action-mark"><Recycle size={19}/></div><div className="action-main"><b>{a.name}</b><p>{a.description}</p><small>{a.difficulty} · {a.estimated_cost} · {a.impact} impact</small></div><div className="action-facility">{a.facility?.name&&<><MapPin size={14}/>{a.facility.name}</>}</div></div>)}</div>
 {actions.length===0&&<Empty/>}
 </>;
}
