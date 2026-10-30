import {NavLink,Outlet} from "react-router-dom";
import {Leaf,LayoutDashboard,Search,GitBranch,Workflow,Wrench,MapPin,Menu,X,ArrowUpRight} from "lucide-react";
import {useState} from "react";
const links=[
  ["/","Overview",LayoutDashboard],["/explore","Explore items",Search],["/recommend","Lifecycle options",GitBranch],
  ["/graph","Graph explorer",Workflow],["/actions","Manage actions",Wrench],["/facilities","Facilities",MapPin]
];
export default function Layout(){
 const [open,setOpen]=useState(false);
 return <div className="app-shell">
  <aside className={`sidebar ${open?"sidebar-open":""}`}>
   <div className="brand"><div className="brand-icon"><Leaf size={21}/></div><div><b>CircularLoop</b><small>Keep resources in motion</small></div><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div>
   <div className="nav-label">WORKSPACE</div><nav>{links.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==="/"} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?"active":""}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-bottom"><div className="eco-card"><div className="eco-icon"><Leaf size={17}/></div><b>Small choices, circular impact.</b><p>Repair first. Reuse what works. Recover what remains.</p></div><span className="version">CIRCULARLOOP · DEMO 1.0</span></div>
  </aside>
  {open&&<div className="scrim" onClick={()=>setOpen(false)}/>}
  <main className="main-area"><header className="topbar"><button className="menu-button" onClick={()=>setOpen(true)}><Menu/></button><div className="breadcrumb">Circular economy <span>/</span> <b>Workspace</b></div><div className="top-status"><span className="status-dot"/> Neo4j connected architecture</div></header><div className="page-wrap"><Outlet/></div></main>
 </div>
}
