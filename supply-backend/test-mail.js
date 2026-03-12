// Script de prueba de correo — ejecutar con: node test-mail.js
require('dotenv').config()
const nodemailer = require('nodemailer')

console.log('🔎 Configuración de correo cargada:')
console.log('  MAIL_ENABLED :', process.env.MAIL_ENABLED)
console.log('  MAIL_HOST    :', process.env.MAIL_HOST)
console.log('  MAIL_PORT    :', process.env.MAIL_PORT)
console.log('  MAIL_SECURE  :', process.env.MAIL_SECURE)
console.log('  MAIL_USER    :', process.env.MAIL_USER)
console.log('  MAIL_TO      :', process.env.MAIL_TO)
console.log('')

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    // Descomenta la siguiente línea si tienes certificado SSL auto-firmado:
    // tls: { rejectUnauthorized: false },
})

async function testMail() {
    // 1. Verificar conexión al servidor SMTP
    console.log('📡 Verificando conexión SMTP...')
    try {
        await transporter.verify()
        console.log('✅ Conexión SMTP exitosa!\n')
    } catch (err) {
        console.error('❌ Error de conexión SMTP:')
        console.error('   Código  :', err.code)
        console.error('   Mensaje :', err.message)
        if (err.code === 'ECONNREFUSED') {
            console.error('\n   👉 El servidor rechazó la conexión. Verifica host y puerto.')
        } else if (err.code === 'ETIMEDOUT') {
            console.error('\n   👉 Tiempo de espera agotado. El firewall puede estar bloqueando el puerto.')
        } else if (err.responseCode === 535) {
            console.error('\n   👉 Credenciales incorrectas (usuario/contraseña).')
        }
        process.exit(1)
    }

    // 2. Enviar correo de prueba
    console.log('📨 Enviando correo de prueba...')
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO,
            subject: '✅ Test SMTP - Sistema de Suministros',
            html: `<p>Este es un correo de <strong>prueba</strong> enviado desde el script de diagnóstico.</p>
                <p>Si recibes esto, la configuración SMTP está funcionando correctamente.</p>`,
        })
        console.log('✅ Correo enviado exitosamente!')
        console.log('   Message ID:', info.messageId)
        console.log('   Respuesta :', info.response)
    } catch (err) {
        console.error('❌ Error al enviar el correo:')
        console.error('   Código    :', err.code)
        console.error('   Respuesta :', err.responseCode)
        console.error('   Mensaje   :', err.message)
    }
}

testMail()
