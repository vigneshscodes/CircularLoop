import {LoaderCircle,AlertCircle,CheckCircle2,SearchX} from "lucide-react";
export function Loading(){return <div className="state-box"><LoaderCircle className="spin" size={25}/><span>Loading graph data…</span></div>}
export function ErrorState({message}){return <div className="state-box error-state"><AlertCircle size={22}/><span>{message||"Something went wrong. Check the API and database connection."}</span></div>}
export function Empty({title="Nothing here yet",text="Try changing your search or filter."}){return <div className="state-box"><SearchX size={25}/><b>{title}</b><span>{text}</span></div>}
export function Toast({message,type="success",onClose}){if(!message)return null;return <div className={`toast ${type}`}><CheckCircle2 size={17}/>{message}<button onClick={onClose}>×</button></div>}
export function PageHeading({eyebrow,title,description,action}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>}
export function Badge({children,tone="green"}){return <span className={`badge ${tone}`}>{children}</span>}
