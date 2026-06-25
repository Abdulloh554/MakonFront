import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req) {
  try {
    const { name, lastName, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Ism va email majburiy' }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 409 })
    }

    const code = generateCode()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Makon" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Makon — tasdiqlash kodi',
      text: `Assalomu alaykum, ${name}!\n\nMakon platformasiga kirish uchun kodingiz: ${code}\n\nIltimos, kodni boshqalarga bermang.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#185FA5;">Assalomu alaykum, ${name}!</h2>
          <p>Makon platformasiga kirish uchun kodingiz:</p>
          <div style="background:#f1f5f9;padding:20px 24px;border-radius:12px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#185FA5;">
            ${code}
          </div>
        </div>
      `,
    })

    await User.create({ name, lastName: lastName || '', email, password: code })

    return NextResponse.json({ success: true, message: 'Kod emailingizga yuborildi', code })
  } catch (err) {
    console.error('Register error:', err)
    const msg = err.code === 'EAUTH'
      ? 'Email autentifikatsiyasi xatoligi. EMAIL_USER yoki EMAIL_PASS noto\'g\'ri.'
      : `Xatolik: ${err.message}`
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
