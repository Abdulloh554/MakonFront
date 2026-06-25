import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email kiriting' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Bu email bilan foydalanuvchi topilmadi' }, { status: 404 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Makon" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Makon — parolingiz',
      text: `Assalomu alaykum, ${user.name}!\n\nMakon platformasiga kirish uchun parolingiz: ${user.password}\n\nIltimos, parolingizni boshqalarga bermang.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#185FA5;">Assalomu alaykum, ${user.name}!</h2>
          <p>Makon platformasiga kirish uchun parolingiz:</p>
          <div style="background:#f1f5f9;padding:20px 24px;border-radius:12px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#185FA5;">
            ${user.password}
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Parol emailingizga yuborildi', code: user.password })
  } catch (err) {
    console.error('Login error:', err)
    const msg = err.code === 'EAUTH'
      ? 'Email autentifikatsiyasi xatoligi. EMAIL_USER yoki EMAIL_PASS noto\'g\'ri.'
      : `Xatolik: ${err.message}`
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
