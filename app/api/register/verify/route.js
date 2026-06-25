import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email va kod kiriting' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    if (user.password !== code) {
      return NextResponse.json({ error: 'Kod noto\'g\'ri' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, lastName: user.lastName, email: user.email },
    })
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
