import { useState } from "react";
import { ContextWrapper } from "./ContextWrapper.tsx";
import OBR, { Vector2, ViewportTransform } from "@owlbear-rodeo/sdk";


export const Views = () => {
  return (
    <ContextWrapper>
      <Content />
    </ContextWrapper>
  );
};

type StarredPosition = {
  name: string;
  transform: ViewportTransform;
}

const Content = () => {
  const [starredViewports, setStarredViewports] = useState<StarredPosition[]>([])
  const [selectedViewport, setSelectedViewport] = useState<ViewportTransform | null>(null)
  const [draftViewportName, setDraftViewportName] = useState<string>("")

  const starViewport = async (name: string) => {
    const [position, scale] = await Promise.all([OBR.viewport.getPosition(), OBR.viewport.getScale()]);
    setStarredViewports(previous => [...previous, { name, transform: {position, scale} }])
    setDraftViewportName("");
  }
  const deleteViewport = (name: string) => {
    
    setStarredViewports(starredViewports.filter(v => v.name !== name))
  }

  return (
    <>
      <ul>
        {starredViewports.map((v) => <li><button onClick={async () => await OBR.viewport.animateTo(v.transform)}>{v.name}
        </button> <button onClick={() => deleteViewport(v.name)}>Del</button>
        </li>)}
      </ul>
<input 
      onChange={(ev)=>setDraftViewportName(ev.target.value)}/>

      <button onClick={()=>starViewport(draftViewportName)}>OK</button></>
  );
};
