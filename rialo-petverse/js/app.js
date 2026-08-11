/* Rialo Petverse — app.js
   Shell + language + wallet connect + digital ID collection + community + RIALO send.
   Swap and the microchip/vet/insurance passport fields land in a later step. */

// ---- CONFIG ----------------------------------------------------------
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // 11155111
const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

// Real RIALO token on Sepolia (pulled from the reference build).
const RIALO_TOKEN = {
  address: "0xE36227c3ec709EB0b539Ce1004E1Ba71D80f4aC5",
  symbol: "RIALO",
  decimals: 18,
  image: "" // TODO: drop in a hosted https:// logo URL if you want one in MetaMask's add-token dialog
};

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// ---- STATE -------------------------------------------------------------
let profile = null;
let walletAddress = null;
let currentPetIndex = 0;
let carouselTimer = null;
let identities = [];
let communities = [];

// ---- INIT ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  applyLanguage("en"); // site always opens in English per spec
  bindLanguageToggle();
  bindWalletButton();
  bindProfileModal();
  bindTokenButton();
  bindNavPlaceholders();
  bindJoinAndCta();
  initPetCarousel();
  loadStoredProfile();

  bindDigitalIdForm();
  loadIdentities();

  bindCommunityForm();
  loadCommunities();

  bindSwapTabs();
  bindSendForm();
});

// ---- LANGUAGE ----------------------------------------------------------
function bindLanguageToggle() {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });
}

// ---- TOAST ----------------------------------------------------------
let toastTimer = null;
function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ---- NAV PLACEHOLDERS (Rialo Proof, Verification, About — still unbuilt) ----
function bindNavPlaceholders() {
  document.querySelectorAll(".main-nav a[data-nav]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showToast(t("comingSoon"));
    });
  });
}

function bindJoinAndCta() {
  document.getElementById("joinBtn").addEventListener("click", async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    openProfileModal();
  });

  document.getElementById("heroCta").addEventListener("click", () => {
    document.getElementById("digitalId").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("myApplicationsBtn").addEventListener("click", () => {
    document.getElementById("collection").scrollIntoView({ behavior: "smooth" });
  });
}

// ---- WALLET CONNECT (Sepolia) ----------------------------------------------------------
function bindWalletButton() {
  document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
}

async function connectWallet() {
  if (!window.ethereum) {
    showToast(t("noWallet"));
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId !== SEPOLIA_CHAIN_ID_HEX) {
      showToast(t("wrongNetwork"));
      await ensureSepolia();
    }

    setWalletStatus(accounts[0]);
    refreshRialoBalanceLabel();
  } catch (err) {
    console.error(err);
  }
}

async function ensureSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
    });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_PARAMS]
        });
      } catch (addErr) {
        console.error(addErr);
        showToast(t("switchFailed"));
      }
    } else {
      showToast(t("switchFailed"));
    }
  }
}

function setWalletStatus(address) {
  walletAddress = address;
  const short = address.slice(0, 6) + "…" + address.slice(-4);

  document.getElementById("connectWalletBtn").hidden = true;
  const badge = document.getElementById("walletBadge");
  badge.hidden = false;
  document.getElementById("walletBadgeAddr").textContent = short;
}

// ---- PROFILE ----------------------------------------------------------
function bindProfileModal() {
  const overlay = document.getElementById("profileModalOverlay");
  document.getElementById("createProfileBtn").addEventListener("click", openProfileModal);
  document.getElementById("profileCancelBtn").addEventListener("click", () => {
    overlay.classList.remove("open");
  });
  document.getElementById("profileSaveBtn").addEventListener("click", saveProfile);
}

function openProfileModal() {
  renderAvatarPickerInto("avatarPicker", profile ? profile.avatar : null);
  if (profile) document.getElementById("profileNameInput").value = profile.name;
  document.getElementById("profileModalOverlay").classList.add("open");
}

// shared avatar-grid renderer, used by the profile modal and the digital ID form
function renderAvatarPickerInto(containerId, selectedId) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = "";
  PET_LIBRARY.forEach(pet => {
    const div = document.createElement("div");
    div.className = "avatar-option" + (selectedId === pet.id ? " selected" : "");
    div.innerHTML = pet.svg;
    div.dataset.petId = pet.id;
    div.addEventListener("click", () => {
      wrap.querySelectorAll(".avatar-option").forEach(o => o.classList.remove("selected"));
      div.classList.add("selected");
    });
    wrap.appendChild(div);
  });
}

function saveProfile() {
  const name = document.getElementById("profileNameInput").value.trim();
  if (!name) {
    showToast(t("profileNameRequired"));
    return;
  }
  const selected = document.querySelector("#avatarPicker .avatar-option.selected");
  const avatarId = selected ? selected.dataset.petId : PET_LIBRARY[0].id;

  profile = { name, avatar: avatarId };
  localStorage.setItem("rialo_profile", JSON.stringify(profile));

  document.getElementById("profileModalOverlay").classList.remove("open");
  showToast(t("profileSaved"));
  updateProfileButtonLabel();
}

function loadStoredProfile() {
  const raw = localStorage.getItem("rialo_profile");
  if (raw) {
    try {
      profile = JSON.parse(raw);
      updateProfileButtonLabel();
    } catch (e) { /* ignore */ }
  }
}

function updateProfileButtonLabel() {
  const label = document.querySelector("#createProfileBtn span[data-i18n]");
  if (!label) return;
  label.textContent = profile ? t("profileGreeting", { name: profile.name }) : t("createProfile");
}

// ---- RIALO TOKEN: add to wallet ----------------------------------------------------------
function bindTokenButton() {
  document.getElementById("addTokenBtn").addEventListener("click", addRialoToken);
}

async function addRialoToken() {
  if (!window.ethereum) {
    showToast(t("noWallet"));
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: RIALO_TOKEN.address,
          symbol: RIALO_TOKEN.symbol,
          decimals: RIALO_TOKEN.decimals,
          image: RIALO_TOKEN.image || undefined
        }
      }
    });
    showToast(t("tokenAdded"));
  } catch (err) {
    console.error(err);
    showToast(t("tokenAddFailed"));
  }
}

// ---- PET CAROUSEL (hero image, 4s interval; side panels + logoShape motifs
// fill the empty space around the pet artwork, recolored/repositioned) ----
function initPetCarousel() {
  const dotsWrap = document.getElementById("petDots");
  PET_LIBRARY.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "pet-dot" + (i === 0 ? " active" : "");
    dotsWrap.appendChild(dot);
  });

  renderPetSlide(0);
  carouselTimer = setInterval(() => {
    currentPetIndex = (currentPetIndex + 1) % PET_LIBRARY.length;
    renderPetSlide(currentPetIndex);
  }, 4000);
}

function renderPetSlide(index) {
  const slide = document.getElementById("petSlide");
  slide.classList.remove("active");
  setTimeout(() => {
    slide.innerHTML = PET_LIBRARY[index].svg;
    slide.classList.add("active");
  }, 200);

  document.querySelectorAll(".pet-dot").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
}

// ---- DIGITAL ID (per-pet identity, feeds the collection below) ----------------------------------------------------------
function bindDigitalIdForm() {
  renderAvatarPickerInto("idAvatarPicker", PET_LIBRARY[0].id);
  document.getElementById("idCreateBtn").addEventListener("click", createIdentity);
}

function loadIdentities() {
  try {
    identities = JSON.parse(localStorage.getItem("rialo_identities") || "[]");
  } catch (e) {
    identities = [];
  }
  renderIdentities();
}

function createIdentity() {
  const name = document.getElementById("idNameInput").value.trim();
  if (!name) {
    showToast(t("idNameRequired"));
    return;
  }
  const selected = document.querySelector("#idAvatarPicker .avatar-option.selected");
  const avatarId = selected ? selected.dataset.petId : PET_LIBRARY[0].id;

  identities.unshift({ id: "id_" + Date.now(), name, avatar: avatarId, createdAt: Date.now() });
  localStorage.setItem("rialo_identities", JSON.stringify(identities));

  document.getElementById("idNameInput").value = "";
  renderAvatarPickerInto("idAvatarPicker", PET_LIBRARY[0].id);
  renderIdentities();
  showToast(t("idCreated"));
}

function renderIdentities() {
  const grid = document.getElementById("identityGrid");
  const empty = document.getElementById("identityEmpty");
  if (!grid) return;
  grid.innerHTML = "";

  identities.forEach(ident => {
    const pet = PET_LIBRARY.find(p => p.id === ident.avatar) || PET_LIBRARY[0];
    const card = document.createElement("div");
    card.className = "identity-card";
    const dateStr = new Date(ident.createdAt).toLocaleDateString(document.documentElement.lang === "tr" ? "tr-TR" : "en-US");
    card.innerHTML = `
      <div class="avatar-wrap">${pet.svg}</div>
      <div class="name">${escapeHtml(ident.name)}</div>
      <div class="meta">${t("idCardMeta", { date: dateStr })}</div>
    `;
    grid.appendChild(card);
  });

  empty.classList.toggle("hidden", identities.length > 0);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- COMMUNITY ----------------------------------------------------------
function bindCommunityForm() {
  document.getElementById("communityCreateBtn").addEventListener("click", createCommunity);
}

function loadCommunities() {
  try {
    communities = JSON.parse(localStorage.getItem("rialo_communities") || "[]");
  } catch (e) {
    communities = [];
  }
  renderCommunities();
}

function createCommunity() {
  const name = document.getElementById("communityNameInput").value.trim();
  const city = document.getElementById("communityCityInput").value.trim();
  if (!name) {
    showToast(t("communityNameRequired"));
    return;
  }
  communities.unshift({ id: "com_" + Date.now(), name, city, members: 1, joined: true });
  localStorage.setItem("rialo_communities", JSON.stringify(communities));

  document.getElementById("communityNameInput").value = "";
  document.getElementById("communityCityInput").value = "";
  renderCommunities();
  showToast(t("communityCreated"));
}

function renderCommunities() {
  const grid = document.getElementById("communityGrid");
  const empty = document.getElementById("communityEmpty");
  if (!grid) return;
  grid.innerHTML = "";

  communities.forEach(com => {
    const card = document.createElement("div");
    card.className = "community-card";
    card.innerHTML = `
      <div class="avatar-wrap">👥</div>
      <div class="name">${escapeHtml(com.name)}</div>
      <div class="meta">${escapeHtml(com.city || "")}${com.city ? " · " : ""}${t("communityMembers", { n: com.members })}</div>
      <button class="join-toggle ${com.joined ? "joined" : ""}" data-id="${com.id}">
        ${com.joined ? t("communityJoined") : t("communityJoin")}
      </button>
    `;
    card.querySelector(".join-toggle").addEventListener("click", () => toggleCommunityJoin(com.id));
    grid.appendChild(card);
  });

  empty.classList.toggle("hidden", communities.length > 0);
}

function toggleCommunityJoin(id) {
  const com = communities.find(c => c.id === id);
  if (!com) return;
  com.joined = !com.joined;
  com.members += com.joined ? 1 : -1;
  localStorage.setItem("rialo_communities", JSON.stringify(communities));
  renderCommunities();
}

// ---- SEND & SWAP ----------------------------------------------------------
function bindSwapTabs() {
  document.querySelectorAll(".swap-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".swap-tab").forEach(x => x.classList.remove("active"));
      tab.classList.add("active");
      const isSend = tab.dataset.tab === "send";
      document.getElementById("sendPanel").hidden = !isSend;
      document.getElementById("swapPanel").hidden = isSend;
    });
  });
}

function getRialoContract(signerOrProvider) {
  if (typeof ethers === "undefined") return null;
  return new ethers.Contract(RIALO_TOKEN.address, ERC20_ABI, signerOrProvider);
}

async function refreshRialoBalanceLabel() {
  const row = document.getElementById("rialoBalanceRow");
  if (!row) return;
  if (!walletAddress || !window.ethereum || typeof ethers === "undefined") {
    row.textContent = t("balanceUnknown");
    return;
  }
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = getRialoContract(provider);
    const raw = await contract.balanceOf(walletAddress);
    const formatted = Number(ethers.utils.formatUnits(raw, RIALO_TOKEN.decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    row.textContent = t("balanceLabel", { bal: formatted });
  } catch (err) {
    console.error(err);
    row.textContent = t("balanceUnknown");
  }
}

function bindSendForm() {
  document.getElementById("sendBtn").addEventListener("click", sendRialo);
}

async function sendRialo() {
  if (!window.ethereum) {
    showToast(t("noWallet"));
    return;
  }
  if (!walletAddress) {
    showToast(t("connectFirst"));
    return;
  }
  const to = document.getElementById("sendToInput").value.trim();
  const amountStr = document.getElementById("sendAmountInput").value.trim();

  if (typeof ethers === "undefined" || !ethers.utils.isAddress(to) || !amountStr || Number(amountStr) <= 0) {
    showToast(t("fillSendForm"));
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = getRialoContract(signer);
    const amount = ethers.utils.parseUnits(amountStr, RIALO_TOKEN.decimals);

    const tx = await contract.transfer(to, amount);
    showToast(t("sendSuccess"));
    document.getElementById("sendToInput").value = "";
    document.getElementById("sendAmountInput").value = "";
    await tx.wait();
    refreshRialoBalanceLabel();
  } catch (err) {
    console.error(err);
    showToast(t("sendFailed"));
  }
}
