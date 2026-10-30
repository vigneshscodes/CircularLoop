import {useEffect,useState} from "react";
import {MapPin,Building2,Recycle} from "lucide-react";
import api from "../api";
import {PageHeading,Loading,ErrorState,Empty,Badge} from "../components/UI";
export default function Facilities(){
 const [data,setData]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{api.get("/facilities").then(r=>setData(r.facilities)).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <><PageHeading eyebrow="CIRCULAR NETWORK" title="Sample facilities" description="See which demonstration facilities are connected to lifecycle actions in the knowledge graph."/><div className="sample-banner"><Building2 size={18}/><span>Demonstration dataset only. These are sample facilities, not verified real-world service providers.</span></div>{error?<ErrorState message={error}/>:loading?<Loading/>:data.length===0?<Empty/>:<div className="facility-grid">{data.map(({facility,actions})=><article className="facility-card" key={facility.id}><div className="facility-icon"><Building2 size={23}/></div><Badge>{facility.type}</Badge><h3>{facility.name}</h3><div className="facility-location"><MapPin size={14}/>{facility.location}</div><p>{facility.description}</p><div className="facility-actions"><Recycle size={14}/><span>{actions.join(" · ")||"No linked actions"}</span></div></article>)}</div>}</>
}
