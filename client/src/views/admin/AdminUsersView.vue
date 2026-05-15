<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Search,
  ShieldCheck,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import TableSkeleton from '@/components/ui/TableSkeleton.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import { useUsersStore } from '@/stores/users.store'
import type { CreateUserPayload, UpdateUserPayload, UserRecord } from '@/services/users.service'

const store = useUsersStore()
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedUser = ref<UserRecord | null>(null)
const currentPage = ref(1)
const pageSize = 10

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return store.users
  return store.users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.employeeCode.toLowerCase().includes(q) ||
      (u.department ?? '').toLowerCase().includes(q),
  )
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const createForm = reactive<Omit<CreateUserPayload, 'employeeCode'>>({
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  department: '',
  position: '',
  role: 'user',
})

const editForm = reactive<UpdateUserPayload & { id: number }>({
  id: 0,
  fullName: '',
  email: '',
  phoneNumber: '',
  department: '',
  position: '',
  role: 'user',
  isActive: true,
})

const resetCreateForm = () => {
  createForm.fullName = ''
  createForm.email = ''
  createForm.password = ''
  createForm.phoneNumber = ''
  createForm.department = ''
  createForm.position = ''
  createForm.role = 'user'
}

const openEdit = (user: UserRecord) => {
  selectedUser.value = user
  editForm.id = user.id
  editForm.fullName = user.fullName
  editForm.email = user.email
  editForm.phoneNumber = user.phoneNumber ?? ''
  editForm.department = user.department ?? ''
  editForm.position = user.position ?? ''
  editForm.role = user.role
  editForm.isActive = user.isActive
  showEditModal.value = true
}

const openDelete = (user: UserRecord) => {
  selectedUser.value = user
  showDeleteConfirm.value = true
}

const handleCreate = async () => {
  const ok = await store.create(createForm as CreateUserPayload)
  if (ok) {
    showCreateModal.value = false
    resetCreateForm()
  }
}

const handleUpdate = async () => {
  const { id, ...payload } = editForm
  const ok = await store.update(id, payload)
  if (ok) showEditModal.value = false
}

const handleDelete = async () => {
  if (!selectedUser.value) return
  const ok = await store.remove(selectedUser.value.id)
  if (ok) showDeleteConfirm.value = false
}

const handleResetPassword = async (user: UserRecord) => {
  resetConfirmUser.value = user
  resetPasswordInput.value = ''
}

const resetConfirmUser = ref<UserRecord | null>(null)
const resetPasswordInput = ref('')
const showResetPasswordField = ref(false)

const confirmResetPassword = async () => {
  if (!resetConfirmUser.value) return
  const customPassword = resetPasswordInput.value.trim()
  await store.resetPassword(resetConfirmUser.value.id, customPassword || undefined)
  resetConfirmUser.value = null
  resetPasswordInput.value = ''
  showResetPasswordField.value = false
}

const closeResetModal = () => {
  resetConfirmUser.value = null
  resetPasswordInput.value = ''
  showResetPasswordField.value = false
}

onMounted(() => store.load())
</script>

<template>
  <AppLayout title="User Management">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            class="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[32px] leading-8 sm:leading-10 font-bold tracking-[-0.4px] sm:tracking-[-0.64px] text-[#191b23]"
          >
            Manajemen User
          </h2>
          <p class="text-sm leading-5 text-[#424754]">
            Kelola akun karyawan dan admin sistem.
          </p>
        </div>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-[9px] text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:-translate-y-px hover:bg-[#004999]"
          @click="showCreateModal = true"
        >
          <Plus :size="18" :stroke-width="2" />
          Tambah User
        </button>
      </div>

      <div
        v-if="store.error || store.successMessage"
        class="flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm"
        :class="
          store.error
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-green-200 bg-green-50 text-green-700'
        "
      >
        <AlertCircle v-if="store.error" :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <CheckCircle2 v-else :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <div class="flex-1">{{ store.error ?? store.successMessage }}</div>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100"
          @click="store.dismissMessages()"
        >
          Tutup
        </button>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Daftar User ({{ store.users.length }})
          </h3>
          <div class="flex items-center gap-2 rounded-full border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[5px]">
            <Search :size="16" :stroke-width="2" class="text-[#6b7280]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari user..."
              class="w-48 border-0 bg-transparent px-2 py-px text-sm text-[#191b23] outline-none placeholder:text-[#6b7280]"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Kode</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Nama</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Email</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Department</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Role</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Status</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Aksi</th>
              </tr>
            </thead>
            <TableSkeleton v-if="store.loading" :rows="6" :columns="7" />
            <tbody v-else-if="filteredUsers.length === 0">
              <tr><td colspan="7" class="px-6 py-10 text-center text-sm text-[#727785]">Tidak ada user ditemukan</td></tr>
            </tbody>
            <tbody v-else>
              <tr v-for="user in paginatedUsers" :key="user.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px] text-xs font-mono text-[#424754]">{{ user.employeeCode }}</td>
                <td class="px-6 py-[14px] text-sm font-medium text-[#191b23]">{{ user.fullName }}</td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ user.email }}</td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ user.department ?? '—' }}</td>
                <td class="px-6 py-[14px]">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="user.role === 'admin' ? 'bg-[rgba(0,88,190,0.1)] text-[#0058be]' : 'bg-[#f2f3fd] text-[#424754]'"
                  >
                    <ShieldCheck v-if="user.role === 'admin'" :size="12" :stroke-width="2" />
                    <UserIcon v-else :size="12" :stroke-width="2" />
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-[14px]">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="user.isActive ? 'bg-[rgba(108,248,187,0.2)] text-[#006c49]' : 'bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]'"
                  >
                    {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="px-6 py-[14px]">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="flex cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent p-1.5 text-[#0058be] transition hover:bg-[#f2f3fd]"
                      title="Edit"
                      @click="openEdit(user)"
                    >
                      <Pencil :size="15" :stroke-width="2" />
                    </button>
                    <button
                      type="button"
                      class="flex cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent p-1.5 text-[#ba1a1a] transition hover:bg-red-50"
                      title="Hapus"
                      @click="openDelete(user)"
                    >
                      <Trash2 :size="15" :stroke-width="2" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          v-if="!store.loading && filteredUsers.length > 0"
          :current-page="currentPage"
          :total-items="filteredUsers.length"
          :page-size="pageSize"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreateModal = false">
        <div class="w-full max-w-[520px] rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 py-4">
            <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">Tambah User Baru</h4>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-[#424754] hover:text-[#191b23]" @click="showCreateModal = false"><X :size="20" :stroke-width="2" /></button>
          </div>
          <form class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" @submit.prevent="handleCreate">
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Nama Lengkap</label>
              <input v-model="createForm.fullName" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Email</label>
              <input v-model="createForm.email" type="email" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Password</label>
              <input v-model="createForm.password" type="password" required minlength="6" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Department</label>
              <input v-model="createForm.department" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Position</label>
              <input v-model="createForm.position" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">No. Telepon</label>
              <input v-model="createForm.phoneNumber" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Role</label>
              <select v-model="createForm.role" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="col-span-1 sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="showCreateModal = false">Batal</button>
              <button type="submit" :disabled="store.saving" class="cursor-pointer rounded-[8px] border-0 bg-[#0058be] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {{ store.saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showEditModal = false">
        <div class="w-full max-w-[520px] rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 py-4">
            <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">Edit User</h4>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-[#424754] hover:text-[#191b23]" @click="showEditModal = false"><X :size="20" :stroke-width="2" /></button>
          </div>
          <form class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" @submit.prevent="handleUpdate">
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Nama Lengkap</label>
              <input v-model="editForm.fullName" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Email</label>
              <input v-model="editForm.email" type="email" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Department</label>
              <input v-model="editForm.department" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Position</label>
              <input v-model="editForm.position" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">No. Telepon</label>
              <input v-model="editForm.phoneNumber" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[#424754]">Role</label>
              <select v-model="editForm.role" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#0058be]">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-3">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-[#424754]">
                <input v-model="editForm.isActive" type="checkbox" class="h-4 w-4 accent-[#0058be]" />
                Akun Aktif
              </label>
            </div>
            <div class="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#c2c6d6] pt-4">
              <button
                type="button"
                class="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-white px-3 py-2 text-[12px] font-medium text-[#924700] transition hover:border-[#924700] hover:bg-orange-50"
                @click="handleResetPassword(selectedUser!)"
              >
                <KeyRound :size="14" :stroke-width="2" />
                Reset Password
              </button>
              <div class="flex gap-2">
                <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="showEditModal = false">Batal</button>
                <button type="submit" :disabled="store.saving" class="cursor-pointer rounded-[8px] border-0 bg-[#0058be] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {{ store.saving ? 'Menyimpan...' : 'Update' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDeleteConfirm = false">
        <div class="w-full max-w-[400px] rounded-[12px] border border-[#c2c6d6] bg-white p-6 shadow-xl">
          <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">Hapus User?</h4>
          <p class="mt-2 text-sm text-[#424754]">
            Yakin mau hapus <span class="font-semibold">{{ selectedUser?.fullName }}</span>? Aksi ini tidak bisa dibatalkan.
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="showDeleteConfirm = false">Batal</button>
            <button type="button" :disabled="store.saving" class="cursor-pointer rounded-[8px] border-0 bg-[#ba1a1a] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="handleDelete">
              {{ store.saving ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="resetConfirmUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeResetModal">
        <div class="w-full max-w-[440px] rounded-[12px] border border-[#c2c6d6] bg-white p-6 shadow-xl">
          <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">Reset Password?</h4>
          <p class="mt-2 text-sm text-[#424754]">
            Reset password untuk <span class="font-semibold">{{ resetConfirmUser.fullName }}</span>. User harus login ulang dengan password baru.
          </p>

          <div class="mt-4 flex flex-col gap-2">
            <label class="text-[13px] font-medium text-[#424754]">Password Baru</label>
            <input
              v-model="resetPasswordInput"
              type="text"
              placeholder="Kosongkan untuk default password123"
              minlength="6"
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none focus:border-[#924700]"
            />
            <p class="text-[11px] text-[#6b7280]">
              Minimal 6 karakter. Jika kosong, password akan direset ke
              <span class="font-mono font-semibold">password123</span>.
            </p>
            <p
              v-if="resetPasswordInput.length > 0 && resetPasswordInput.trim().length < 6"
              class="text-[11px] font-medium text-[#ba1a1a]"
            >
              Password minimal 6 karakter, atau kosongkan untuk pakai default.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="closeResetModal">Batal</button>
            <button
              type="button"
              :disabled="store.saving || (resetPasswordInput.length > 0 && resetPasswordInput.trim().length < 6)"
              class="cursor-pointer rounded-[8px] border-0 bg-[#924700] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              @click="confirmResetPassword"
            >
              {{ store.saving ? 'Mereset...' : 'Reset Password' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
