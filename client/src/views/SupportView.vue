<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ChevronDown, HelpCircle, Mail, Phone, Clock } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAttendanceStore } from '@/stores/attendance.store'

const store = useAttendanceStore()
const openIndex = ref<number | null>(null)

const toggle = (i: number) => {
  openIndex.value = openIndex.value === i ? null : i
}

onMounted(async () => {
  if (!store.config.workStartTime || store.config.workStartTime === '08:30') {
    await store.loadConfig()
  }
})

interface FaqItem {
  question: string
  answer: string
}

const faqs = ref<FaqItem[]>([])

const buildFaqs = () => {
  const cfg = store.config
  faqs.value = [
    {
      question: 'Kenapa absen masuk ditolak?',
      answer: `Absen masuk bisa ditolak karena dua alasan:\n\n1. Lokasi GPS — Anda harus berada dalam radius kantor (maksimal 100 meter dari titik koordinat kantor).\n\n2. Jam kerja — Absen masuk hanya bisa dilakukan paling cepat ${cfg.earlyCheckInMaxHours} jam sebelum jam masuk (${cfg.workStartTime}) dan paling lambat ${cfg.lateCheckInMaxHours} jam setelah jam masuk. Di luar jendela waktu tersebut, sistem akan menolak dan meminta Anda menghubungi HR.`,
    },
    {
      question: 'Bagaimana cara reset password?',
      answer:
        'Saat ini fitur reset password mandiri belum tersedia. Silakan hubungi admin atau tim IT melalui kontak di bawah halaman ini untuk meminta reset password akun Anda.',
    },
    {
      question: "Kenapa status saya 'Terlambat'?",
      answer: `Status "Terlambat" otomatis diberikan jika Anda check-in lebih dari ${cfg.lateToleranceMinutes} menit setelah jam masuk (${cfg.workStartTime}). Artinya, batas toleransi adalah pukul ${addMinutes(cfg.workStartTime, cfg.lateToleranceMinutes)} WIB. Check-in sebelum waktu tersebut akan tercatat sebagai "Hadir".`,
    },
    {
      question: 'GPS tidak bisa diakses / lokasi diblokir',
      answer:
        'Jika muncul pesan "Akses lokasi diblokir", ikuti langkah berikut:\n\n• Chrome/Edge: Klik ikon gembok di sebelah kiri URL → Site settings → Location → Allow\n• Brave: Klik ikon singa di address bar → turunkan Shields untuk situs ini, atau buka brave://settings/content/location\n• Firefox: Klik ikon gembok → hapus block pada "Access Your Location"\n\nSetelah mengubah setting, refresh halaman dan coba lagi.',
    },
    {
      question: 'Berapa minimal jam kerja sebelum bisa pulang?',
      answer: `Durasi kerja minimal adalah ${cfg.minWorkDurationHours} jam terhitung dari waktu check-in. Jika Anda mencoba check-out sebelum durasi tersebut tercapai, sistem akan menolak dengan pesan error. Jika ada keperluan mendesak, hubungi atasan untuk izin pulang awal.`,
    },
    {
      question: 'Apa itu status "Izin Pulang Awal"?',
      answer: `Status ini diberikan otomatis jika Anda check-out sebelum jam pulang (${cfg.workEndTime} WIB), namun sudah memenuhi durasi kerja minimal ${cfg.minWorkDurationHours} jam. Status ini tercatat di riwayat absensi Anda.`,
    },
    {
      question: 'Apakah bisa absen dari luar kantor?',
      answer:
        'Tidak. Sistem menggunakan GPS untuk memverifikasi bahwa Anda berada dalam radius kantor saat check-in maupun check-out. Pastikan GPS/Location Services di perangkat Anda aktif dan browser memiliki izin akses lokasi.',
    },
  ]
}

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

onMounted(() => {
  buildFaqs()
})
</script>

<template>
  <AppLayout title="Support">
    <div class="mx-auto flex max-w-3xl flex-col gap-8 pb-12">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
          >
            <HelpCircle :size="22" :stroke-width="2" />
          </div>
          <div>
            <h2
              class="font-['Plus_Jakarta_Sans'] text-[28px] leading-9 font-bold tracking-[-0.5px] text-[#191b23]"
            >
              Pusat Bantuan
            </h2>
            <p class="text-sm leading-5 text-[#424754]">
              Temukan jawaban untuk pertanyaan umum seputar sistem absensi.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="border-b border-[#c2c6d6] last:border-b-0"
        >
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-6 py-5 text-left transition hover:bg-[#f9f9ff]"
            @click="toggle(i)"
          >
            <span class="text-sm leading-5 font-semibold text-[#191b23]">
              {{ faq.question }}
            </span>
            <ChevronDown
              :size="18"
              :stroke-width="2"
              class="shrink-0 text-[#424754] transition-transform"
              :class="openIndex === i ? 'rotate-180' : ''"
            />
          </button>
          <div
            v-if="openIndex === i"
            class="border-t border-[#c2c6d6] bg-[#f9f9ff] px-6 py-4"
          >
            <p class="text-sm leading-6 whitespace-pre-line text-[#424754]">
              {{ faq.answer }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-6">
        <h3
          class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
        >
          Masih butuh bantuan?
        </h3>
        <p class="mt-1 text-sm leading-5 text-[#424754]">
          Hubungi tim IT Support kami melalui:
        </p>
        <div class="mt-4 flex flex-col gap-3">
          <div class="flex items-center gap-3 text-sm text-[#191b23]">
            <Mail :size="16" :stroke-width="2" class="text-[#0058be]" />
            <span>it.support@company.com</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-[#191b23]">
            <Phone :size="16" :stroke-width="2" class="text-[#0058be]" />
            <span>0812-3456-7890 (WhatsApp)</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-[#191b23]">
            <Clock :size="16" :stroke-width="2" class="text-[#0058be]" />
            <span>Senin - Jumat, 08:00 - 17:00 WIB</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
