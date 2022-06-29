const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const PublitioAPI = require('publitio_js_sdk').default;
const publitio = new PublitioAPI('blabla', 'blabla')



const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


app.get('/api/v1/presupuestos/docs', (req, res) => {
    publitio.call('/files/list', 'GET', { offset: '0', limit: '100', order: 'date' })
        .then((data) => {
            console.log(data),
                res.status(200).send({ message: data })
        }).catch((error) => {
            console.log(error),
                res.status(400).send({ error: error, message: 'ERROR AL LISTAR CONTENIDO' })
        })
})


app.post('/api/v1/presupuestos/createpdf', (req, res) => {

    let doc = new PDFDocument;
    const fecha = new Date();

    const {
        numeroCodigo,
        cliente,
        ficha,
        servicios,
        cantidadTotal,
        precioTotal,
        descuento,
        observacion,
    } = req.body;

    function formatoFecha(fecha, formato) {
        const map = {
            dd: fecha.getDate(),
            mm: fecha.getMonth() + 1,
            yy: fecha.getFullYear().toString().slice(-2),
            yyyy: fecha.getFullYear()
        }
        return formato.replace(/dd|mm|yyyy|yyy/gi, matched => map[matched])
    };

    function formatoHora() {
        let hora = fecha.getHours();
        let minutos = fecha.getMinutes();
        let segundos = fecha.getSeconds();
        return hora + '-' + minutos + '-' + segundos;
    };

    let fechaPresupuesto = formatoFecha(fecha, 'dd-mm-yyyy')
    let horaPresupuesto = formatoHora();
    let email = cliente.email;
    let clienteIdentidad = cliente.nombre + ' ' + cliente.apellido;
    let clienteTelefono = cliente.telefono1;
    let clienteDireccion = cliente.direccion;
    let clienteEmpresa = cliente.empresa;
    let fichaNombre = ficha.nombre;
    let fichaMedidas = ficha.medidaFleco + ' x ' + ficha.medidaOrilla;
    // let archivoPDF = 'presupuesto' + '-' + numeroCodigo + '-' + fechaPresupuesto + '-' + horaPresupuesto + '.pdf';
    let archivoPDF = 'presupuesto' + '-' + numeroCodigo + '-' + fechaPresupuesto + '.pdf';
    let path = 'docs/' + archivoPDF;

    console.log('===> Enviar el pdf a: ', email);
    console.log('* FECHA :', fechaPresupuesto);
    console.log('* N° PRESUPUESTO: ', numeroCodigo);
    console.log('* CLIENTE: ', clienteIdentidad);
    console.log(`* FICHA TÉCNICA: ${fichaNombre} - MEDIDAS: ${fichaMedidas}`);
    console.log('* CANTIDAD TOTAL: ', cantidadTotal);
    console.log('* DESCUENTO: ', descuento);
    console.log('* OBSERVACIÓN: ', observacion)
    console.log('* PRECIO TOTAL', precioTotal);
    // console.log('* SERVICIOS: ', servicios[0].servicios);
    servicios[0].servicios.forEach(element => {
        console.log(`Cantidad: ${element.cantidad} | Servicio: ${element.servicio.nombre} ${element.servicio.tipo} | Precio: $${element.servicio.precioTotalServicio}`);
    });

    // -------------------------------- CREAR PDF ------------------------------------- //
    function crearPDF() {
        doc.pipe(fs.createWriteStream(path))

        // ----------- CABECERA   ---------------            
        doc.image('images/logo.jpg', 83, 63, {
            width: 110,
            align: 'left'
        });

        doc.fontSize(16);
        doc
            .text('Reparación de lala', {
                align: 'center',
                stroke: 1,
                width: 630
            });

        doc
            .text('LAala pepe lala', {
                align: 'center',
                stroke: 1,
                width: 630,
            });

        doc.fontSize(9);
        doc
            .moveDown()
            .text('Tel.: 2323-3333 / Cel. 555566666', {
                align: 'center',
                width: 630
            });

        doc
            .text('Email - testmail@gmail.com', {
                align: 'center',
                width: 630
            });

        doc
            .text('www.pepefeliz.com', {
                align: 'center',
                width: 630
            });

        // rectangulo cabecera
        doc.rect(doc.x, 42, 460, doc.y).stroke();

        // ------------------INFORMACION----------------------

        //rectangulo informacion
        doc.
        rect(72, 193, 460, 500).stroke();

        doc.fontSize(12)
        doc
            .moveDown(4)
            .text('     PRESUPUESTO', {
                width: 140,
                align: 'center',
                stroke: 1
            });

        doc
            .text(`     ${numeroCodigo}`, {
                width: 140,
                align: 'center'
            });

        doc.fillColor('#504e4e')
        doc.fontSize(5)
        doc
            .text('DOCUMENTO NO VÁLIDO COMO FACTURA', {
                indent: 19,
                width: 140,
                align: 'center'
            });

        doc.fontSize(10);
        doc.fillColor('black');
        doc
            .moveUp(1)
            .text(`Fecha: ${fechaPresupuesto}`, 100, doc.y, {
                width: 400,
                align: 'right'
            });

        doc
            .moveDown(0.5)
            .text(`Nombre y Apellido: ${clienteIdentidad}`, {
                width: 400,
                align: 'left'
            });

        doc
            .moveDown(0.5)
            .text(`Dirección: ${clienteDireccion}`, {
                width: 400,
                align: 'left'
            });

        doc
            .moveDown(0.5)
            .text(`Teléfono: ${clienteTelefono}`, {
                width: 400,
                align: 'left'
            });

        doc
            .moveDown(0.5)
            .text(`Email: ${cliente.email}`, {
                width: 400,
                align: 'left'
            });

        doc
            .moveDown(0.5)
            .text(`Empresa: ${clienteEmpresa}`, {
                width: 400,
                align: 'left'
            });

        //----------TABLA------------                    

        doc
            .moveDown(2)
            .text('                                                    DETALLE                                                      IMPORTE', {
                height: 300,
                width: 500,
                align: 'left'
            });

        doc
            .moveDown(2)
            .text(`Ficha técnica:`, 105, doc.y, {
                width: 100

            });

        doc.fillColor('#504e4e')
        doc
            .moveUp()
            .text(`${fichaNombre} - Medidas: ${fichaMedidas}`, 169, doc.y, {
                width: 315
            });

        doc.fillColor('black')
        doc
            .moveDown()
            .text(`Servicios:`, 105, doc.y, {
                width: 100

            });

        doc.fillColor('#504e4e')
            // doc.moveDown();            
        servicios[0].servicios.forEach(element => {
            doc.text(`${element.cantidad} ${element.servicio.nombre} ${element.servicio.tipo}. Precio $${element.servicio.precioTotalServicio}`, 105, doc.y, {
                width: 315
            });
        });

        doc.fillColor('black')
        doc
            .moveDown()
            .text('Cantidad de servicios:', 105, doc.y, {
                width: 300
            });

        doc.fillColor('#504e4e')
        doc
            .moveUp()
            .text(`${cantidadTotal}`, 206, doc.y, {
                width: 315
            });

        doc.fillColor('black')
        doc
            .moveDown()
            .text('Descuento:', 105, doc.y, {
                width: 300
            });

        doc.fillColor('#504e4e')
        doc
            .moveUp()
            .text(`$${descuento}`, 158, doc.y, {
                width: 300
            });

        doc.fillColor('black')
        doc
            .moveDown()
            .text(`Observaciones:`, 105, doc.y, {
                width: 100
            });

        doc.fillColor('#504e4e')
        doc.text(`${observacion}`, 105, doc.y, {
            width: 315
        });

        doc.fillColor('black')
        doc
            .text(`TOTAL $  ${precioTotal}`, 378, 660, {
                width: 315,
            });

        //tabla
        doc.rect(100, 340, 320, 300).stroke();
        doc.rect(100, 340, 400, 300).stroke();
        doc.rect(100, 370, 400, 270).stroke();
        doc.rect(420, 650, 80, 30).stroke();


        doc.end();
        // doc.pipe(res);
    };


    // ------------------------------ SUBIR A PUBLIT.IO PDF --------------------------- //
    function subirPublit() {
        setTimeout(() => {
            let file = fs.readFileSync(path);
            console.log('--> Subiendo archivo ...')
            publitio.uploadFile(file, 'file', {
                    title: archivoPDF,
                    description: clienteIdentidad,
                    tags: 'pdf',
                    privacy: '1',
                    option_download: '1'
                })
                .then((data) => {
                    console.log(data.url_download);
                    console.log('ARCHIVO SUBIDO CON EXITO!!');
                })
                .catch((error) => {
                    console.log('ERROR AL SUBIR EL ARCHIVO', error);
                })
        }, 4000)
    }


    // -------------------------------- BORRAR PDF después de 4 segundos --------------- //
    function borrarPDF() {
        setTimeout(() => {
            console.log('--> Vaciando directorio docs/ ...')
            fs.unlinkSync(path);
        }, 10000);
    }


    crearPDF();
    subirPublit();

    // ---------------------------- ENVIAR PDF POR EMAIL ------------------------------- //
    contentHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 62%; margin-left: 4%;">  
            <img src="cid:logo@nodemailer.com"/>                
        </div>    

        <h1 style="padding: 0 5%; font-size: 1.3rem; margin-top: 2%; color: #000;">Estimado/a ${clienteIdentidad}</h1>

        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div style="padding: 0 5%; padding-bottom: 3%;">
                <p style="font-size: .9rem; color: #000;">Tenemos el agrado de enviarle la cotización de los servicios solicitados de manera adjunta en formato PDF.</p>
                <p style="font-size: .9rem; font-weight: 600; color: #000;">Para confirmar el trabajo a realizar por favor contáctese con nosotros a este mismo email.</p>
            </div>
        </div>            

        <hr>

        <div style="display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: 6%;">
            <div style="background-color: #b8933282; padding: 5%; max-width: 400px; border-radius: 6px;">
                <p style="color: #272626c9; font-size: .8rem;">A sus servicios desde 1960, amplia experiencia, trabajamos por recomendación</p>

                <h2 style="font-size: .9rem; color: #77622b; font-weight: 600;">Nuestros trabajos:</h2>
                <ul style="color: #272626c9">
                    <li>
                        <p style="color: #272626c9; margin: 2% 0; font-size: .8rem;">Restauración</p>

                    </li>
                    <li>
                        <p style="color: #272626c9; margin: 2% 0; font-size: .8rem;">Lavado profesional</p>
                    </li>
                    <li>
                        <p style="color: #272626c9; margin: 2% 0; font-size: .8rem; max-width: 400px;">Mantenimiento de lalalalalalalalala aallalallaal alalalala allaala </p>                    
                    </li>
                    <li>
                        <p style="color: #272626c9; margin: 2% 0; font-size: .8rem;">Tasaciones, compra y venta</p>                    
                    </li>   
                    <li>
                        <p style="color: #272626c9; margin: 2% 0; font-size: .8rem;">Retiro y entrega a domicilio (en fecha acordada)</p>                    
                    </li>          
                </ul>

                <h2 style="font-size: .9rem; color: #77622b; font-weight: 600; margin-top: 4%;">Contáctenos</h2>

                <div style="background-color: #b89332f0; padding: 5% 0; max-width: 400px; border-radius: 20px;">
                    <ul style="list-style: circle; color: #272626f2">
                        <li>
                            <p style="color: #272626f2; margin: 2% 0; font-size: .8rem;">
                                Teléfonos de contacto: 011-24234-4444 / 15-8888-9999
                            </p>
                        </li>
                        <li>
                            <p style="color: #272626f2; margin: 2% 0; font-size: .8rem; text-decoration: none;">
                            Email: loquesea@gmail.com
                            </p>
                        </li>
                        <li>
                            <p style="color: #272626f2; margin: 2% 0; font-size: .8rem;">
                                <a style="color: #272626f2;" href="http://pepefeliz.com/">Visitar sitio web</a></p>
                            </p>
                        </li>                            
                    </ul>                    


                    <hr style="background-color: #b8933282;">
                    <p style="margin: 0; color: #272626f2; font-weight: 600; font-style: italic; font-size: .8rem; text-align: center;">Restauraciones lallala</p>
                    <p style="margin:0; color: #272626f2; font-style: italic; font-size: .8rem; text-align: center;">Buenos Aires - Argentina</p>
                </div>   
            </div>
        </div>
    `;

    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID, // ClientID
        process.env.CLIENTE_SECRET, // Client Secret
        process.env.REDIRECT_URL // Redirect URL
    );

    oauth2Client.setCredentials({
        refres_token: process.env.REFRESH_TOKEN
    });

    const accessToken = oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "pepe@gmail.com",
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENTE_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: '"Restauraciones llalaa" <lalalgmail.com>',
        to: email,
        bcc: 'pepepe@gmail.com',
        subject: 'Enviado desde la app pepe',
        generateTextFromHTML: true,
        html: contentHTML,
        attachments: [{
                path: path
            },
            {
                filename: 'loguito.png',
                path: 'images/loguito.png',
                cid: 'logo@nodemailer.com'
            }
        ]
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Mensaje enviado: %s', info.messageId)
        }
    });


    borrarPDF();
});


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`==> Server running on port ${PORT}`);
});




// ----------------- FUNCION BACKUPS -----------
// function subirPublit() {
//     let file = fs.readFileSync(path);
//     console.log(file)
//         publitio.uploadFile(file, 'file', {
//                 title: archivoPDF,
//                 description: clienteIdentidad,
//                 tags: 'pdf',
//                 privacy: '1',
//                 option_download: '1'
//             })
//             .then((data) => {
//                 console.log(data.url_download);
//                 console.log('ARCHIVO SUBIDO CON EXITO!!');
//             })
//             .catch((error) => {
//                 console.log('ERROR AL SUBIR EL ARCHIVO', error);
//             })
// }