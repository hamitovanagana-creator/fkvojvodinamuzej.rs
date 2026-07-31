/* Najbolje Slot Igre — Vue 3 interactive islands.
   Each component mounts only if its root element exists on the page,
   so a single shared bundle works across every page without errors.
   Static markup already in the HTML is the SEO/no-JS fallback; Vue
   takes over the same data once mounted (progressive enhancement). */
(function () {
  "use strict";
  var createApp = Vue.createApp;

  /* ---------- Cookie consent ---------- */
  var cookieEl = document.getElementById("cookie-app");
  if (cookieEl) {
    createApp({
      data: function () {
        return { visible: false };
      },
      mounted: function () {
        try {
          this.visible = !localStorage.getItem("nsi-cookie-consent");
        } catch (e) {
          this.visible = true;
        }
      },
      methods: {
        accept: function () {
          this.visible = false;
          try {
            localStorage.setItem("nsi-cookie-consent", "1");
          } catch (e) {}
        },
      },
      template:
        '<div class="cookie-banner" v-if="visible" role="dialog" aria-label="Kolačići">' +
        '<button type="button" class="cookie-banner__close" aria-label="Zatvori" @click="accept">✕</button>' +
        '<p>Ovaj sajt koristi kolačiće radi boljeg korisničkog iskustva. Nastavkom pregleda saglasni ste sa upotrebom kolačića i našom <a href="/privacy-policy/" style="font-weight:700;color:var(--navy-800)">Politikom privatnosti</a>.</p>' +
        '<div class="cookie-banner__actions">' +
        '<button type="button" class="btn-gold" @click="accept" style="flex:1;justify-content:center">Prihvatam</button>' +
        '</div></div>',
    }).mount(cookieEl);
  }

  /* ---------- Back to top ---------- */
  var topEl = document.getElementById("to-top-app");
  if (topEl) {
    createApp({
      data: function () {
        return { visible: false };
      },
      mounted: function () {
        var self = this;
        window.addEventListener(
          "scroll",
          function () {
            self.visible = window.scrollY > window.innerHeight;
          },
          { passive: true }
        );
      },
      methods: {
        scrollTop: function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      template:
        '<button type="button" class="to-top" :class="{ \'is-visible\': visible }" aria-label="Nazad na vrh" @click="scrollTop">↑</button>',
    }).mount(topEl);
  }

  /* ---------- FAQ accordion ---------- */
  var faqEl = document.getElementById("faq-app");
  if (faqEl) {
    var faqData = JSON.parse(document.getElementById("faq-data").textContent);
    createApp({
      data: function () {
        return { items: faqData.map(function (it, i) { return Object.assign({ open: i === 0 }, it); }) };
      },
      methods: {
        toggle: function (i) {
          this.items[i].open = !this.items[i].open;
        },
      },
      template:
        '<div class="faq-item" v-for="(it, i) in items" :key="i" :class="{ \'is-open\': it.open }">' +
        '<div class="faq-item__q" @click="toggle(i)" role="button" tabindex="0" @keydown.enter="toggle(i)">' +
        "<span>{{ it.q }}</span><span class=\"plus\">+</span></div>" +
        '<div class="faq-item__a"><div class="faq-item__a-inner">{{ it.a }}</div></div></div>',
    }).mount(faqEl);
  }

  /* ---------- Slot grid: search / filter / sort ---------- */
  var slotEl = document.getElementById("slot-app");
  if (slotEl) {
    var slots = JSON.parse(document.getElementById("slots-data").textContent);
    var volLabel = { niska: "Niska", srednja: "Srednja", visoka: "Visoka" };

    createApp({
      data: function () {
        return {
          slots: slots,
          query: "",
          provider: "sve",
          sort: "popularno",
        };
      },
      computed: {
        providers: function () {
          var set = {};
          this.slots.forEach(function (s) {
            set[s.provider] = true;
          });
          return Object.keys(set);
        },
        filtered: function () {
          var q = this.query.trim().toLowerCase();
          var provider = this.provider;
          var list = this.slots.filter(function (s) {
            var matchesQuery = !q || s.name.toLowerCase().indexOf(q) !== -1;
            var matchesProvider = provider === "sve" || s.provider === provider;
            return matchesQuery && matchesProvider;
          });
          var sort = this.sort;
          if (sort === "rtp") {
            list = list.slice().sort(function (a, b) {
              return b.rtp - a.rtp;
            });
          } else if (sort === "naziv") {
            list = list.slice().sort(function (a, b) {
              return a.name.localeCompare(b.name);
            });
          } else if (sort === "isplata") {
            list = list.slice().sort(function (a, b) {
              return b.maxWinValue - a.maxWinValue;
            });
          }
          return list;
        },
      },
      methods: {
        volLabel: function (v) {
          return volLabel[v] || v;
        },
      },
      template:
        '<div class="toolbar">' +
        '<div class="toolbar__search">🔍 <input type="text" v-model="query" placeholder="Pretraži slot igre..." aria-label="Pretraga slotova"></div>' +
        '<div class="toolbar__filters">' +
        '<button type="button" class="chip" :class="{ \'is-active\': provider === \'sve\' }" @click="provider = \'sve\'">Svi provajderi</button>' +
        '<button type="button" class="chip" v-for="p in providers" :key="p" :class="{ \'is-active\': provider === p }" @click="provider = p">{{ p }}</button>' +
        "</div>" +
        '<div class="toolbar__sort"><select v-model="sort" aria-label="Sortiraj">' +
        '<option value="popularno">Popularno</option>' +
        '<option value="rtp">Najviši RTP</option>' +
        '<option value="isplata">Najveća isplata</option>' +
        '<option value="naziv">Naziv A–Ž</option>' +
        "</select></div>" +
        '<div class="toolbar__count">{{ filtered.length }} slot igara</div>' +
        "</div>" +
        '<div class="slot-grid">' +
        '<a v-for="s in filtered" :key="s.slug" :href="\'/slotovi/\' + s.slug + \'/\'" class="slot-card">' +
        '<div class="slot-card__banner"><span class="slot-card__provider-tag">{{ s.provider }}</span><img :src="s.img" :alt="s.name + \' — promo grafika\'" loading="lazy"></div>' +
        '<div class="slot-card__body">' +
        '<div class="slot-card__title">{{ s.name }}</div>' +
        '<p class="slot-card__desc">{{ s.desc }}</p>' +
        '<div class="slot-card__badges">' +
        '<span class="badge badge--rtp">RTP {{ s.rtpLabel || (s.rtp + \'%\') }}</span>' +
        '<span class="badge" :class="\'badge--vol-\' + s.volatility">{{ volLabel(s.volatility) }} volatilnost</span>' +
        "</div>" +
        '<div class="slot-card__foot"><span class="slot-card__win">Maks. dobitak <b>{{ s.maxWin }}</b></span><span class="slot-card__link">Recenzija →</span></div>' +
        "</div></a>" +
        '<div class="slot-empty" v-if="!filtered.length">Nema rezultata za zadatu pretragu. Pokušajte drugi termin ili provajder.</div>' +
        "</div>",
    }).mount(slotEl);
  }
})();
