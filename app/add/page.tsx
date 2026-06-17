'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, addProperty, useHydrated } from '@/lib/store'
import AuthRequired from '@/components/AuthRequired'
import PageTransition from '@/components/PageTransition'
import PageHeader from '@/components/ui/PageHeader'
import PropertyForm from '@/components/properties/PropertyForm'
import type { PropertyFormData } from '@/components/properties/PropertyForm'
import type { PropertyType, DealType, PropertyStatus } from '@/lib/types'

export default function AddPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const hydrated = useHydrated()
  const user = hydrated ? getCurrentUser() : null
  const showAuth = hydrated && !user

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(form: PropertyFormData) {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      alert('Iltimos, avval tizimga kiring')
      router.push('/profile')
      return
    }
    setSaving(true)

    try {
      let { lat, lng } = form
      if (form.address.trim()) {
        try {
          const res = await fetch(
            'https://nominatim.openstreetmap.org/search?format=json&q=' +
            encodeURIComponent(form.address + ', Uzbekistan') +
            '&limit=1'
          )
          const data = await res.json()
          if (data.length > 0) {
            lat = parseFloat(data[0].lat)
            lng = parseFloat(data[0].lon)
          }
        } catch {}
      }

      let images: string[]
      if (form.imageFiles.length > 0) {
        images = await Promise.all(form.imageFiles.map(fileToBase64))
      } else {
        images = ['https://picsum.photos/seed/default/600/400']
      }

      await addProperty({
        title: form.title,
        description: form.description,
        price: form.price,
        type: form.type as PropertyType,
        dealType: form.dealType as DealType,
        status: form.status as PropertyStatus,
        images,
        location: { lat, lng, address: form.address },
        area: form.area,
        rooms: form.rooms,
        floor: form.type === 'apartment' || form.type === 'commercial' ? form.floor : undefined,
        totalFloors: form.type === 'apartment' || form.type === 'commercial' ? form.totalFloors : undefined,
        installmentMonths: form.dealType === 'installment' ? form.installmentMonths : undefined,
        installmentPrice: form.dealType === 'installment' && form.installmentMonths > 0 ? Math.round(form.price / form.installmentMonths) : undefined,
      })
      setSaving(false)
      router.push('/')
    } catch (e: unknown) {
      setSaving(false)
      if (e instanceof Error) {
        alert(e.message)
      }
    }
  }

  if (showAuth) {
    return <AuthRequired />
  }

  return (
    <PageTransition>
      <PageHeader title="Elon qo'shish" />
      <PropertyForm onSubmit={handleSubmit} saving={saving} />
    </PageTransition>
  )
}
