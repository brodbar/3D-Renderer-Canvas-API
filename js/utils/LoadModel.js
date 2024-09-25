import Vertice from "../components/Vertice.js";
import { Vector3 } from '../components/Vector.js';

const Triangle = (vertices) =>
{
    return vertices.map(v => new Vector3(parseFloat(v.x), parseFloat(v.y), parseFloat(v.z)));
}

async function LoadModel(modelName)
{
    const objData = await fetch(`./models/${modelName}.obj`);
    return await objData.text();
}

async function LegacyParse(modelName, camera, {x, y, z} = {x : 0, y : 0, z : 0})
{
    const modelData = (await LoadModel(modelName)).split("\n");
    const vertices = modelData.filter(d => d.substring(0, 2) == "v ").map(d => new Vertice(d.replace("v ", "").replace(/\/+[0-9]*/g, "").trim().split(" "), {x, y, z}));
    const meshes = modelData.filter(d => d.substring(0, 2) == "f ").map(d => d.replace("f ", "").replace(/\/+[0-9]*/g, "").trim().split(" "));
    
    const newMeshes = [];
    let dist = 0;
    meshes.forEach(m =>
    {
        if(m.length > 3)
        {
            newMeshes.push([m[0], m[1], m[2]]);
            newMeshes.push([m[0], m[2], m[3]]);
        }
        else
            newMeshes.push(m);
        dist = Math.max(dist, camera.distance(new Vector3(m[0], m[1], m[2])));
    });
    camera.setPos(dist * 0.4, dist * 0.4, dist * 0.4);
    
    return { meshes: newMeshes.map(m => { return { tri: Triangle([vertices[m[0] - 1], vertices[m[1] - 1], vertices[m[2] - 1]])}})};
}

async function ParseModel(modelName, camera, {x, y, z} = {x : 0, y : 0, z : 0})
{
    const data = await LoadModel(modelName);
    const MtlExist = data.replaceAll("\r", "").match(/newmtl([^]*?)endmtl/g);
    if(!MtlExist) return await LegacyParse(modelName, camera, { x , y, z });
    const Mtl = MtlExist.map(m => m.split("\n"));
    const Faces = data.replaceAll("\r", "").split("usemtl").map(x => x.trim());
    Faces.shift();
    const MtlData = {};

    Mtl.forEach(m =>
    {
        const name = m[0].split(" ")[1];
        MtlData[name] = m[1].replace("Kd ", "").split(" ").map(x => parseFloat(x) * 255);
    })
    
    const modelData = data.split("\n");
    const vertices = modelData.filter(d => d.substring(0, 2) == "v ").map(d => new Vertice(d.replace("v ", "").replace(/\/+[0-9]*/g, "").trim().split(" "), {x, y, z}));

    let newMeshes = [];
    let newColors = [];
    let dist = 0;
    Faces.forEach(f =>
    {
        const name = f.split("\n")[0];
        let meshes = f.split("\n").filter(d => d.substring(0, 2) == "f ").map(d => d.replace("f ", "").trim().split(" "));
    
        meshes.forEach(m =>
        {
            let mm = m.map(x => x.replace(/\/+[0-9]*/g, ""));
            if(m.length > 3)
            {
                newMeshes.push([mm[0], mm[1], mm[2], MtlData[name]]);
                newMeshes.push([mm[0], mm[2], mm[3], MtlData[name]]);
                newColors.push(MtlData[name]);
                newColors.push(MtlData[name]);
            }
            else
            {
                newMeshes.push([...mm, MtlData[name]])
                newColors.push(MtlData[name]);
            }
            dist = Math.max(dist, camera.distance(new Vector3(mm[0], mm[1], mm[2])));
        });
    });
    camera.setPos(dist, dist, dist);
    
    return { meshes: newMeshes.map(m => { return { tri: Triangle([vertices[m[0] - 1], vertices[m[1] - 1], vertices[m[2] - 1]]), color: m[3]}}), colors: newColors };
}

export { ParseModel };