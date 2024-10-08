import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import fs from 'fs'

import { loadPNG, getTopNColorsPNG, bytesArePNG } from './lib/top_colors_png.js'
import { loadJPEG, getTopNColorsJPEG, bytesAreJPEG } from './lib/top_colors_jpeg.js'

const port = 8080;
const app = express();
app.use(cors());
app.use(express.json());

app.post("/colors", async (req,res)=>{
    let n = Number(req.query.n) || 5
    if(isNaN(n)) n = 5;

    if(!req.body.src) return res.status(401).json({
        error: "Invalid body. Expected 'src' for image"
    })
    try {
        const image = await fetch(req.body.src)
        const path = "tmp_src_"+Date.now()
        const abuff = await image.arrayBuffer()
        const imgBytes = Buffer.from(abuff)

        let extension;
        if(bytesArePNG(imgBytes)) extension = ".png"
        if(bytesAreJPEG(imgBytes)) extension = ".jpeg"
        if(!extension) throw new Error("Unrecognized image type. Expected png or jpeg")
        await fs.promises.writeFile(path+extension,imgBytes)
        
        const dest = path+extension

        let colors;
        switch(extension){
            case ".png": {
                const {png,error} = await loadPNG(dest)
                if(error) throw error;
                colors = getTopNColorsPNG(png,n)
            }
            case ".jpeg": {
                const {jpeg,error} = await loadJPEG(dest)
                if(error) throw error;
                colors = getTopNColorsJPEG(jpeg,n);
                break
            }
            default: throw new Error("Unrecognized extension: " + extension)

        }
        //cleanup temp download
        if(extension) await fs.promises.unlink(dest)
        return res.status(200).json({colors})       
    } catch (error) {
        console.error(error)
        return res.status(500).json({error})
    }

})

app.listen(port,() => console.log(`server listening on port :${port}`));
