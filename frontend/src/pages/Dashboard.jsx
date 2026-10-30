import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowRight,Boxes,Recycle,Package,Leaf,Compass,Activity} from "lucide-react";
import api from "../api";
import {Loading,ErrorState,PageHeading,Badge} from "../components/UI";
const cards=[["items","Electronic items",Package],["actions","Lifecycle actions",Recycle],["components","Components mapped",Boxes],["materials","Materials tracked",Leaf]];
export default function Dashboard(){
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{api.get("/dashboard").then(r=>setData(r.stats)).catch(e=>setError(e.message));},[]);
 return <><PageHeading eyebrow="YOUR CIRCULAR WORKSPACE" title="Make the next step count." description="Explore the parts, materials and pathways that keep electronics in use for longer." action={<Link className="button primary" to="/explore">Explore items <ArrowRight size={16}/></Link>}/>
 {error?<ErrorState message={error}/>:!data?<Loading/>:<div className="stats-grid">{cards.map(([key,label,Icon])=><div className="stat-card" key={key}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={19}/></div></div><strong>{data[key]}</strong><small>Live count from Neo4j</small></div>)}</div>}
 <div className="dashboard-grid"><section className="panel journey-panel"><div className="panel-kicker">THE CIRCULAR JOURNEY</div><h2>One device. Many possible next lives.</h2><p className="muted">CircularLoop follows relationships from a device to its components, materials, lifecycle actions and sample facilities.</p><div className="journey-steps">{[["01","Device","Identify what you have"],["02","Components","See what can be recovered"],["03","Materials","Understand resource value"],["04","Next action","Choose a practical pathway"]].map(([n,t,d],i)=><div className="journey-step" key={n}><div className="step-number">{n}</div><div><b>{t}</b><small>{d}</small></div>{i<3&&<ArrowRight className="step-arrow" size={17}/>}</div>)}</div><Link to="/graph" className="text-link">Explore the connected graph <ArrowRight size={15}/></Link></section>
 <section className="panel quick-panel"><div className="panel-kicker">QUICK START</div><h2>Where would you like to begin?</h2><Link to="/explore" className="quick-link"><div className="quick-icon"><Compass/></div><div><b>Find your device</b><small>Browse the curated item catalogue</small></div><ArrowRight size={17}/></Link><Link to="/recommend" className="quick-link"><div className="quick-icon"><Activity/></div><div><b>Find lifecycle options</b><small>Compare repair, reuse and recycling</small></div><ArrowRight size={17}/></Link><div className="note-box"><Leaf size={17}/><span>Recommendations are rule-based and use curated Neo4j graph relationships.</span></div></section></div>
 <div className="footer-note">CircularLoop is an educational demonstration. Facility entries are sample data, not verified service providers.</div></>
}
