import {Routes,Route} from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Explore from "./pages/Explore.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import Recommend from "./pages/Recommend.jsx";
import Graph from "./pages/Graph.jsx";
import Actions from "./pages/Actions.jsx";
import Facilities from "./pages/Facilities.jsx";
export default function App(){return <Routes><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="explore" element={<Explore/>}/><Route path="items/:id" element={<ItemDetails/>}/><Route path="recommend" element={<Recommend/>}/><Route path="graph" element={<Graph/>}/><Route path="actions" element={<Actions/>}/><Route path="facilities" element={<Facilities/>}/><Route path="*" element={<Dashboard/>}/></Route></Routes>}
