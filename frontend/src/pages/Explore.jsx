import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Search,ArrowUpRight,Laptop,Smartphone,Monitor,Refrigerator,Headphones,Tablet,SlidersHorizontal} from "lucide-react";
import api from "../api";
import {Loading,ErrorState,Empty,PageHeading,Badge} from "../components/UI";
const icons=[Laptop,Smartphone,Tablet,Monitor,Monitor,Refrigerator,Refrigerator,Headphones];
export default function Explore(){
 const [items,setItems]=useState([]),[search,setSearch]=useState(""),[category,setCategory]=useState("All"),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{api.get("/items").then(r=>setItems(r.items)).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const categories=["All",...new Set(items.map(i=>i.category))];
 const shown=useMemo(()=>items.filter(i=>(category==="All"||i.category===category)&&`${i.name} ${i.brand} ${i.description}`.toLowerCase().includes(search.toLowerCase())),[items,category,search]);
 return <><PageHeading eyebrow="DEVICE LIBRARY" title="Explore electronic items" description="Start with a device to uncover its components, material makeup and circular pathways."/>
 <div className="filter-bar"><div className="search-wrap"><Search size={18}/><input placeholder="Search devices, brands or descriptions…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filter-select"><SlidersHorizontal size={16}/><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><span className="result-count">{shown.length} devices</span></div>
 {error?<ErrorState message={error}/>:loading?<Loading/>:shown.length===0?<Empty title="No matching devices" text="Try another keyword or category."/>:<div className="item-grid">{shown.map((item,i)=>{const Icon=icons[items.findIndex(x=>x.id===item.id)%icons.length]||Laptop;return <article className="item-card" key={item.id}><div className="item-card-top"><div className="device-icon"><Icon size={25}/></div><Badge tone={item.condition==="working"?"green":item.condition==="non-functional"?"red":"amber"}>{item.condition}</Badge></div><div className="item-category">{item.category} · {item.brand}</div><h3>{item.name}</h3><p>{item.description}</p><Link to={`/items/${item.id}`} className="card-link">Explore device <ArrowUpRight size={16}/></Link></article>})}</div>}</>
}
