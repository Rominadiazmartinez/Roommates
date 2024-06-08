const express = require("express")
const fs = require("fs/promises")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.listen(3000, () =>{
    console.log("Servidor escuchando en el puerto 3000")
})

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

let transporter =
    nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'chan.nito2309@gmail.com',
    pass: "uuts snlm odde lkai ",
    },
    tls: {
        rejectUnauthorized: false
      }
})

let rutaUsuarios = __dirname +  "/usuario.json"
let rutaGastos = __dirname +  "/gastos.json"

app.post("/roommate", async(req, res) =>{
    try {
        let response = await fetch("https://randomuser.me/api")
        let data = await response.json()
        let usuarioCompleto = data.results[0]

        let {first, last} = usuarioCompleto.name 
        let {email} = usuarioCompleto

        let usuario = {
            id: uuidv4().slice(0,6),
            nombre: first,
            apellido: last,
            correo: email,
            debe: 0,
            recibe: 0
        }

        let dataUsuarios = await fs.readFile(rutaUsuarios, "utf-8")
        
        dataUsuarios = JSON.parse(dataUsuarios)
        
        dataUsuarios.roommates.push(usuario)
        dataUsuarios = JSON.stringify(dataUsuarios, null, 4)
        
        await fs.writeFile(rutaUsuarios, dataUsuarios, "utf-8")

        res.status(201).send("Usuario fue creado con éxito")
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

app.get("/roommates", async(req, res) =>{
    try {
        let dataUsuarios = await fs.readFile(rutaUsuarios, "utf-8")      
         dataUsuarios = JSON.parse(dataUsuarios)
        res.status(200).send(dataUsuarios)
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

app.get("/gastos", async(req, res) =>{
    try {
        let dataGastos = await fs.readFile(rutaGastos, "utf-8")      
        dataGastos = JSON.parse(dataGastos)
        res.status(200).send(dataGastos)
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

app.post("/gasto", async(req, res) =>{
    try {
        let {roommate, descripcion, monto} = req.body

        let gasto = {
            id: uuidv4().slice(0,6),
            roommate,
            descripcion,
            monto
        }
         let dataGastos = await fs.readFile(rutaGastos, "utf-8")
        
         dataGastos = JSON.parse(dataGastos)
        
         dataGastos.gastos.push(gasto)
         dataGastos = JSON.stringify(dataGastos, null, 4)
        
         await fs.writeFile(rutaGastos, dataGastos, "utf-8")

         let dataUsuarios = await fs.readFile(rutaUsuarios, "utf-8")      
         dataUsuarios = JSON.parse(dataUsuarios)
         let usuario = dataUsuarios.roommates.find((usuario) => usuario.nombre == roommate)

         await transporter.sendMail({
            from: '"Chanito Escarcha 😺" <chan.nito2309@gmail.com>', 
            to: "alejandro_beristain@hotmail.com", 
            subject: `${roommate}, bienvenido 😺`, 
            text: "Somos la mejor banda ameba", 
            html: `<b>
              Estimado, ${roommate}, hemos recibido su solicitud, será notificado 
              
      
              Copia de su mensaje: 
            </b>`, 
          });
        res.status(201).send("Gasto fue creado con éxito")
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

app.put("/gasto", async(req, res) =>{
    try {
        let {roommate, descripcion, monto} = req.body
        let {id} = req.query

        let dataGastos = await fs.readFile(rutaGastos, "utf-8")     
        dataGastos = JSON.parse(dataGastos)
        
        let gastoModificado = dataGastos.gastos.find((gasto) => gasto.id == id)
        if(gastoModificado){
            gastoModificado.roommate = roommate,
            gastoModificado.descripcion = descripcion
            gastoModificado.monto = monto
        }
        dataGastos = JSON.stringify(dataGastos, null, 4)

        await fs.writeFile(rutaGastos, dataGastos, "utf-8")
        res.status(200).send("Gasto modificado con éxito")
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

app.delete("/gasto", async(req, res) =>{
    try {
        let {id} = req.query

        let dataGastos = await fs.readFile(rutaGastos, "utf-8")     
        dataGastos = JSON.parse(dataGastos)
        
        let gastoEliminado = dataGastos.gastos.filter((gasto) => gasto.id != id)
        dataGastos.gastos = gastoEliminado
        
        dataGastos =  JSON.stringify(dataGastos, null, 4)

        await fs.writeFile(rutaGastos, dataGastos, "utf-8")
         res.status(200).send("Gasto eliminado con éxito")
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
})

   
    