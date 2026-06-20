<script setup>
import { ref, onMounted, computed } from "vue";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

const name = ref("");
const phone = ref("");
const contacts = ref([]);
const search = ref("");
const sortOrder = ref("asc");
const editId = ref(null);
const avatar = ref(null);

const editContact = (contact) => {
  editId.value = contact.id;

  name.value = contact.name;
  phone.value = contact.phone;
};

const filteredContacts = computed(() => {
  let result = contacts.value.filter((contact) => {
    return (
      (contact.name || "").toLowerCase().includes(search.value.toLowerCase()) ||
      (contact.phone || "").includes(search.value)
    );
  });

  result.sort((a, b) =>
    sortOrder.value === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  return result;
});

const handleFileChange = (event) => {
  avatar.value = event.target.files[0];
};

const getContacts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "contacts"));

    contacts.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error mengambil data:", error);
  }
};

const deleteContact = async (id) => {
  try {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus kontak ini?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "contacts", id));

    await getContacts();

    alert("Kontak berhasil dihapus");
  } catch (error) {
    console.error(error);
    alert("Gagal menghapus kontak");
  }
};

const updateContact = async () => {
  try {
    await updateDoc(doc(db, "contacts", editId.value), {
      name: name.value,
      phone: phone.value,
    });

    await getContacts();

    alert("Data berhasil diupdate");

    editId.value = null;
    name.value = "";
    phone.value = "";
    avatar.value = null;
  } catch (error) {
    console.error(error);
    alert("Gagal update");
  }
};

const saveContact = async () => {
  try {
    if (!name.value || !phone.value) {
      alert("Nama dan nomor HP wajib diisi!");
      return;
    }

    let avatarUrl = "";
    if (avatar.value) {
      const fileRef = storageRef(storage, `avatars/${Date.now()}-${avatar.value.name}`);

      await uploadBytes(fileRef, avatar.value);

      avatarUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, "contacts"), {
      name: name.value,
      phone: phone.value,
      avatar: avatarUrl,
      createdAt: new Date(),
    });

    await getContacts();

    alert("Data berhasil disimpan");

    editId.value = null;
    name.value = "";
    phone.value = "";
    avatar.value = null;
  } catch (error) {
    console.error("Error menyimpan data:", error);
    alert("Gagal menyimpan data");
  }
};

onMounted(() => {
  getContacts();
});
</script>

<template>
  <div class="container">
    <h1>📱 Phonebook App</h1>

    <div class="form-group">
      <label>Nama</label>
      <input v-model="name" type="text" placeholder="Masukkan nama" />
    </div>

    <div class="form-group">
      <label>Nomor HP</label>
      <input v-model="phone" type="text" placeholder="Masukkan nomor HP" />
    </div>

    <div>
      <label>Avatar</label>

      <input type="file" @change="handleFileChange" />
    </div>

    <button v-if="!editId" @click="saveContact">Tambah Kontak</button>

    <button v-else @click="updateContact">Simpan Perubahan</button>

    <h2>Daftar Kontak</h2>

    <div class="search-container">
      <input v-model="search" placeholder="🔍 Cari kontak..." />

      <button @click="sortOrder = 'asc'">A-Z</button>

      <button @click="sortOrder = 'desc'">Z-A</button>
    </div>

    <div v-if="contacts.length === 0" class="empty-state">📭 Belum ada kontak</div>

    <div v-for="contact in filteredContacts" :key="contact.id" class="contact-card">
      <img v-if="contact.avatar" :src="contact.avatar" :alt="contact.name" width="100" />
      <h3>{{ contact.name }}</h3>
      <p>{{ contact.phone }}</p>
      <button @click="editContact(contact)">Edit</button>
      <button class="delete-btn" @click="deleteContact(contact.id)">Hapus</button>
    </div>
  </div>
</template>
<style scoped>
* {
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

h2 {
  margin-top: 10px;
  margin-bottom: 15px;
  color: #34495e;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

input[type="text"],
input[type="file"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 14px;
}

input[type="text"]:focus {
  outline: none;
  border-color: #42b883;
}

button {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

button:hover {
  transform: translateY(-2px);
}

button:not(.delete-btn) {
  background: #42b883;
  color: white;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

hr {
  margin: 30px 0;
  border: none;
  border-top: 1px solid #eee;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #fafafa;
}

.contact-card img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.contact-card h3 {
  margin: 0;
  color: #2c3e50;
}

.contact-card p {
  margin: 4px 0 0;
  color: #666;
}

.contact-card button {
  margin-left: auto;
}

.contact-card .delete-btn {
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #888;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-container input {
  flex: 1;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    padding: 16px;
  }

  .contact-card {
    flex-direction: column;
    text-align: center;
  }

  .contact-card button {
    margin-left: 0;
    width: 100%;
  }

  .contact-card .delete-btn {
    margin-left: 0;
  }

  .search-container {
    flex-direction: column;
  }
}
</style>
