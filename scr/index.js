'use strict'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const { type } = require('os');
var orden_id=0;

//config puerto
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Se eliminan atributos segun se requiera
function deleteAtri(productos){
    delete productos['descripcion'];
    delete productos['iva'];
    delete productos['descuento'];
    delete productos['precio'];
    delete productos['inventario'];
    delete productos['fecha_creacion'];
}
function deleteAtri2(productos){
    delete productos['descripcion'];
    delete productos['descuento'];
    delete productos['fecha_creacion'];
}
function deleteAtri3(productos){
    delete productos['precio'];
    delete productos['inventario'];
    delete productos['fecha_creacion'];
}
//Calculo del precio final aplicando iva y descuentos
function calculoPrecio(productos){
    let precio=productos['precio'];
    let iva=productos['iva'];
    let descuento=productos['descuento'];
    precio=precio-(precio*descuento)+(precio*iva);
    productos.precio_final=precio; //se añade el atributo precio final junto con el valor
    return precio;
}

//Endpoint Post inserta producto en web
app.post('/admin/producto', (req, res) => { 
    let Newproduct=req.body;
    console.log(req.body); 
    let date = new Date();  //Generar la fecha actual 
    let output = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
    console.log(output);
    Newproduct.fecha_creacion=output; 
    let file=fs.readFileSync('scr/datos/productos.json');
    if(file==0){ //si el json productos esta vacio 
        fs.writeFile('scr/datos/productos.json',Newproduct = JSON.stringify(req.body,null,2),function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
            res.status(200).send({message:'Producto agregado satisfactoriamente'})
        });
    }
    else{ //si ya tiene contenido el json productos 
        fs.appendFile('scr/datos/productos.json',Newproduct = JSON.stringify(req.body,null,2),function (err){
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
            res.status(200).send({message:'Producto agregado satisfactoriamente'})
        });
    }
    /*
    fs.writeFile('scr/datos/productos.json',Newproduct = JSON.stringify(req.body,null,2),function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
        res.status(200).send({message:'Producto agregado satisfactoriamente'})
    
     /*
    var obj={productos:[]};
    let Newproduct=req.body;
    let file=fs.readFileSync('scr/datos/productos.json');
    if (file.length == 0) {
        fs.writeFile('scr/datos/productos.json',Newproduct,function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
            res.status(200).send({message:'Producto agregado satisfactoriamente'})
         });
        res.status(200).send({message:'Producto agregado satisfactoriamente'})
    } 
    else {
        //append data to jso file
        var productos = JSON.parse(file)
        //add json element to json object
        console.log(typeof productos);
        fs.appendFile('scr/datos/productos.json',Newproduct,function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
            res.status(200).send({message:'Producto agregado satisfactoriamente'})
         });
    }
    */

});

//Endpoint Get lista de productos en la pagina web
app.get('/admin/producto', (req, res) => { 
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        deleteAtri2(productos);
        res.send(JSON.stringify(productos,null,2));
        console.log(productos);
        
    });
});

//Endpoint Get consulta de productos sku en la pagina web

app.get('/admin/producto/:sku', (req, res) => { 
    let sku=req.params.sku;
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        var sku_data=productos['SKU'];
        console.log(productos)
        if(sku == sku_data){
            res.send(data);
        }
        else{
            res.status(404).send({message:'El producto no se encuentra'})
        }
        
        console.log(productos);
        
    });
   
    
});

//Endpoint elmininar producto web
app.delete('/admin/producto/:sku', (req, res) => { 
    let sku=req.params.sku;
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        let sku_data=productos['SKU'];
        if(sku == sku_data){
            let borrar='{}';
            fs.writeFile('scr/datos/productos.json',borrar,function (err) {
                if (err) throw err;
                console.log('Producto eliminado');
                res.status(200).send({message:'Producto eliminado satisfactoriamente'})
             });
        }
        else{
            res.status(404).send({message:'El producto no se encuentra'})
        }
        console.log(productos);
        
    });
});


//Endpoint put sitio web

app.put('/admin/producto/:sku', (req, res) => { 
    let newData=req.body;
    let sku=req.params.sku;
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos =JSON.parse(data);
        console.log(typeof productos);
        const change=Object.assign(productos,newData);
        console.log(change);
        let sku_data=productos['SKU'];
        if(sku == sku_data){
            fs.writeFile('scr/datos/productos.json',JSON.stringify(change,null,2),function (err) {
                    if (err) throw err;
                    console.log('Producto modifcidado');
                    res.status(200).send({message:'Producto modificado satisfactoriamente'})
            });
        }
        else{
            res.status(404).send({message:'El producto no se encuentra'})
        }
        console.log('Producto modificado');
         ;
    });
});


//Endpoint consultar ordenes web

app.get('/admin/ordenes', (req, res) => { 
    fs.readFile('scr/datos/clientes.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        res.send(data);
        console.log(productos);
    });
});

//Endpoint listar producto app movil 
app.get('/producto', (req, res) => { 
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        calculoPrecio(productos);
        deleteAtri(productos);
        console.log(productos);
        res.send(JSON.stringify(productos,null,2));  
    });
});

//endpoint consultar compra app movil 
app.get('/producto/:sku', (req, res) => { 
    let sku=req.params.sku;
    fs.readFile('scr/datos/productos.json', (err, data) => {
        if (err) throw err;
        let productos = JSON.parse(data);
        let sku_data=productos['SKU'];
        if(sku_data==sku){
            calculoPrecio(productos);
            deleteAtri3(productos);
            console.log(productos);
            res.status(200).send(JSON.stringify(productos,null,2));
        }
        else{
            res.status(404).send({message:'El producto no existe'})
        }
          
    });
});

//Endpoint resumen de comprar app movil
app.post('/resumen', (req, res) => { 
    console.log(req.body);
    let skus=req.body.SKU;
    fs.readFile('scr/datos/productos.json', (err, data) => { 
        if (err) throw err;
        let productos = JSON.parse(data);
        calculoPrecio(productos);
        deleteAtri(productos);
        let sku_data=productos['SKU'];
        if(skus==sku_data){
            res.status(200).send(JSON.stringify(productos,null,2));
        }
        console.log(productos) 
        
     });
  
});

//Endpoint compras por app movil 
app.post('/comprar', (req, res) => { 
    console.log(req.body);
    let orden=req.body;
    let skus=req.body.SKU;
    fs.readFile('scr/datos/productos.json', (err, data) => { //lectura de json
        if (err) throw err;
        let productos = JSON.parse(data);
        let sku_data=productos['SKU'];
        if(skus==sku_data){
            fs.writeFile('scr/datos/ordenes.json',JSON.stringify(orden,null,2),function (err) {
                if (err) throw err;
                orden_id=orden_id+1;
                res.status(200).send({message:'Compra satisfactoria #',orden:orden_id});
            }); 
            
        }
        else{
            res.status(404).send({message:'Compra no exitosa'});
        }
        console.log(productos) 
        
     });
   
});

app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
});

