<script setup lang="ts">
import { onMounted, ref, reactive, computed, nextTick, watch } from 'vue'
import { ChevronLeft, ChevronRight, Save, Moon, Sun, X, Users } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'

interface UserOption {
  id: number
  fullName: string
  employeeCode: string
}

interface ScheduleDay {
  id?: number
  date: string
  shiftName: string
  startTime: string
  endTime: string
  room: string | null
  isActive: boolean
  leaderId: number | null
  leader: UserOption | null
  members: UserOption[]
}

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const schedules = ref<ScheduleDay[]>([])
const users = ref<UserOption[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const editingDate = ref<string | null>(null)

const today = new Date()
const todayDow = today.getDay() === 0 ? 7 : today.getDay()
const weekOffset = ref(0)

const weekStart = computed(() => {
  const d = new Date(today)
  d.setDate(today.getDate() - (todayDow - 1) + weekOffset.value * 7)
  return d
})

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(weekStart.value.getDate() + i)
    return {
      date: d,
      dateStr: d.toISOString().slice(0, 10),
      dayName: dayNames[d.getDay()],
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    }
  }),
)

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const weekLabel = computed(() => {
  const s = weekDays.value[0]
  const e = weekDays.value[6]
  return `${s.num} – ${e.num} ${monthNames[e.date.getMonth()]} ${e.date.getFullYear()}`
})

const editForm = reactive({
  shiftName: 'PAGI',
  startTime: '08:00',
  endTime: '17:00',
  room: '',
  isActive: true,
  leaderId: null as number | null,
  memberIds: [] as number[],
})

const getScheduleForDate = (dateStr: string) => schedules.value.find((s) => s.date === dateStr)

const loadData = async () => {
  loading.value = true
  try {
    const start = weekDays.value[0].dateStr
    const end = weekDays.value[6].dateStr
    const [{ data: schedData }, { data: usersData }] = await Promise.all([
      api.get('/schedules', { params: { start, end } }),
      api.get('/users'),
    ])
    schedules.value = schedData.data
    users.value = usersData.data
  } catch {
    error.value = 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

const openEdit = (dateStr: string) => {
  editingDate.value = dateStr
  const existing = getScheduleForDate(dateStr)
  if (existing) {
    editForm.shiftName = existing.shiftName
    editForm.startTime = existing.startTime
    editForm.endTime = existing.endTime
    editForm.room = existing.room || ''
    editForm.isActive = existing.isActive
    editForm.leaderId = existing.leaderId
    editForm.memberIds = existing.members.map((m) => m.userId)
  } else {
    editForm.shiftName = 'PAGI'
    editForm.startTime = '08:00'
    editForm.endTime = '17:00'
    editForm.room = ''
    editForm.isActive = true
    editForm.leaderId = null
    editForm.memberIds = []
  }
}

const closeEdit = () => { editingDate.value = null }

const saveDay = async () => {
  if (!editingDate.value) return
  saving.value = true
  error.value = null
  success.value = null
  try {
    await api.put(`/schedules/${editingDate.value}`, {
      shiftName: editForm.shiftName,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      room: editForm.room || null,
      isActive: editForm.isActive,
      leaderId: editForm.leaderId,
      memberIds: editForm.memberIds,
    })
    success.value = `Jadwal ${editingDate.value} disimpan`
    closeEdit()
    await loadData()
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

const toggleMember = (userId: number) => {
  const idx = editForm.memberIds.indexOf(userId)
  if (idx >= 0) editForm.memberIds.splice(idx, 1)
  else editForm.memberIds.push(userId)
}

const availableMembers = computed(() =>
  users.value.filter((u) => u.id !== editForm.leaderId),
)

watch(() => editForm.leaderId, (newLeaderId) => {
  if (newLeaderId) {
    const idx = editForm.memberIds.indexOf(newLeaderId)
    if (idx >= 0) editForm.memberIds.splice(idx, 1)
  }
})

const navigate = async (dir: number) => {
  weekOffset.value += dir
  await nextTick()
  await loadData()
}

onMounted(() => loadData())
</script>

<template>
  <AppLayout title="Jadwal Kerja">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Kelola Jadwal Kerja
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Atur shift, ruangan, dan tim per tanggal. Klik hari untuk edit.</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#424754] hover:-translate-y-px" @click="navigate(-1)">
            <ChevronLeft :size="14" /> Sebelumnya
          </button>
          <span class="px-3 text-sm font-semibold text-[#191b23]">{{ weekLabel }}</span>
          <button type="button" class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#424754] hover:-translate-y-px" @click="navigate(1)">
            Berikutnya <ChevronRight :size="14" />
          </button>
        </div>
      </div>

      <div
        v-if="error || success"
        class="flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm"
        :class="error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'"
      >
        <span class="flex-1">{{ error ?? success }}</span>
        <button type="button" class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100" @click="error = null; success = null">Tutup</button>
      </div>

      <div v-if="loading" class="rounded-[12px] border border-[#c2c6d6] bg-white p-8 text-center text-sm text-[#424754]">Memuat...</div>

      <div v-else class="grid grid-cols-7 gap-3">
        <div
          v-for="wd in weekDays"
          :key="wd.dateStr"
          class="rounded-[12px] border bg-white p-4 transition hover:shadow-md cursor-pointer min-h-[160px] flex flex-col"
          :class="[
            wd.isToday ? 'border-[#0058be] ring-1 ring-[#0058be]/20' : 'border-[#c2c6d6]',
            getScheduleForDate(wd.dateStr) && !getScheduleForDate(wd.dateStr)!.isActive ? 'opacity-60' : '',
          ]"
          @click="openEdit(wd.dateStr)"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-[10px] font-bold tracking-widest text-[#424754]">{{ wd.dayName.toUpperCase() }}</div>
            <div class="text-lg font-bold" :class="wd.isToday ? 'text-[#0058be]' : 'text-[#191b23]'">{{ wd.num }}</div>
          </div>

          <template v-if="getScheduleForDate(wd.dateStr)">
            <template v-if="getScheduleForDate(wd.dateStr)!.isActive">
              <span class="inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[9px] font-bold bg-[rgba(0,108,73,0.1)] text-[#006c49] mb-2">
                <Sun :size="9" /> {{ getScheduleForDate(wd.dateStr)!.shiftName }}
              </span>
              <div class="font-mono text-sm font-bold text-[#191b23]">
                {{ getScheduleForDate(wd.dateStr)!.startTime }} – {{ getScheduleForDate(wd.dateStr)!.endTime }}
              </div>
              <div v-if="getScheduleForDate(wd.dateStr)!.room" class="mt-1 text-[10px] text-[#424754]">{{ getScheduleForDate(wd.dateStr)!.room }}</div>
              <div v-if="getScheduleForDate(wd.dateStr)!.leader" class="mt-auto pt-2 flex items-center gap-1 text-[10px] text-[#0058be]">
                <Users :size="10" /> {{ getScheduleForDate(wd.dateStr)!.leader!.fullName }}
              </div>
            </template>
            <template v-else>
              <div class="flex flex-1 flex-col items-center justify-center gap-1 text-[#9499b0]">
                <Moon :size="22" />
                <span class="text-[10px] font-semibold tracking-widest">OFF DAY</span>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="flex flex-1 flex-col items-center justify-center gap-1 text-[#c2c6d6]">
              <span class="text-[10px] font-medium">Belum diatur</span>
              <span class="text-[9px]">Klik untuk set</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="editingDate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeEdit">
        <div class="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 py-4">
            <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">
              Edit Jadwal — {{ editingDate }}
            </h4>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-[#424754] hover:text-[#191b23]" @click="closeEdit">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <form class="flex flex-col gap-4 p-6" @submit.prevent="saveDay">
            <label class="flex cursor-pointer items-center gap-3 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-4 py-3">
              <input v-model="editForm.isActive" type="checkbox" class="h-4 w-4 accent-[#0058be]" />
              <span class="text-sm font-medium text-[#191b23]">Hari Aktif (bukan OFF day)</span>
            </label>

            <template v-if="editForm.isActive">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-medium text-[#424754]">Nama Shift</label>
                  <select v-model="editForm.shiftName" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]">
                    <option value="PAGI">Pagi</option>
                    <option value="SIANG">Siang</option>
                    <option value="MALAM">Malam</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-medium text-[#424754]">Ruangan</label>
                  <input v-model="editForm.room" type="text" placeholder="Ruang Utama A" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-medium text-[#424754]">Jam Mulai</label>
                  <input v-model="editForm.startTime" type="time" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-medium text-[#424754]">Jam Selesai</label>
                  <input v-model="editForm.endTime" type="time" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-medium text-[#424754]">Team Leader</label>
                <select v-model="editForm.leaderId" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]">
                  <option :value="null">— Tidak ada —</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">{{ u.fullName }} ({{ u.employeeCode }})</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[13px] font-medium text-[#424754]">Anggota Tim</label>
                <div class="max-h-40 overflow-y-auto rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] p-3">
                  <label v-for="u in availableMembers" :key="u.id" class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[rgba(0,88,190,0.05)]">
                    <input type="checkbox" :checked="editForm.memberIds.includes(u.id)" class="h-3.5 w-3.5 accent-[#0058be]" @change="toggleMember(u.id)" />
                    <span class="text-[#191b23]">{{ u.fullName }}</span>
                    <span class="text-[10px] text-[#727785]">{{ u.employeeCode }}</span>
                  </label>
                </div>
                <p class="text-[11px] text-[#727785]">{{ editForm.memberIds.length }} anggota dipilih</p>
              </div>
            </template>

            <div class="flex justify-end gap-2 border-t border-[#c2c6d6] pt-4">
              <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="closeEdit">Batal</button>
              <button type="submit" :disabled="saving" class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                <Save :size="14" />
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
