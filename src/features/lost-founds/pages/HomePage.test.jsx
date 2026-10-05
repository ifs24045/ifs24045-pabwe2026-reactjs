import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import HomePage from "./HomePage";
import { asyncSetLostFounds, asyncSetIsLostFoundAdd } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    asyncSetLostFounds: vi.fn(() => async () => {}),
    asyncSetIsLostFoundAdd: vi.fn(() => async () => {}),
  };
});
vi.mock("../components/StatsSection", () => ({
  default: () => <section id="statistik">Bagian Statistik</section>,
}));

const items = [
  {
    id: "1",
    title: "Dompet hitam",
    description: "Hilang di kantin lantai 2",
    status: "lost",
    is_completed: 0,
    cover: "https://img.test/dompet.png",
    author: { name: "Budi" },
    created_at: "2026-10-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Kunci motor",
    description: "Ditemukan dekat parkiran",
    status: "found",
    is_completed: "1",
    cover: null,
    author: "Siti",
    created_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "3",
    title: "Payung biru",
    description: "Tertinggal di perpustakaan",
    status: "lost",
    is_completed: 1,
    cover: null,
    author: null,
    created_at: null,
  },
  {
    id: "4",
    title: "Tas ransel",
    description: "Ditemukan di aula",
    status: "found",
    is_completed: 0,
    cover: null,
    author: {},
    created_at: "2026-10-12T10:00:00Z",
  },
];

function renderHome({ state = { lostFounds: items }, route = "/" } = {}) {
  return renderWithProviders(<HomePage />, { preloadedState: state, route });
}

async function renderLoaded(options) {
  const result = renderHome(options);
  await waitFor(() =>
    expect(screen.queryByText("Memuat laporan...")).not.toBeInTheDocument()
  );
  return result;
}

function summaryValue(label) {
  return screen.getByText(label, { selector: "p" }).nextElementSibling;
}

function cardTitles() {
  return screen.queryAllByRole("heading", { level: 3 }).map((el) => el.textContent);
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe("pemuatan data", () => {
    it("memuat seluruh laporan saat halaman dibuka", async () => {
      await renderLoaded();

      expect(asyncSetLostFounds).toHaveBeenCalledTimes(1);
      expect(asyncSetLostFounds).toHaveBeenCalledWith({});
    });

    it("menampilkan teks memuat selama data diambil", () => {
      asyncSetLostFounds.mockImplementationOnce(() => () => new Promise(() => {}));

      renderHome();

      expect(screen.getByText("Memuat laporan...")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("menampilkan judul halaman dan bagian statistik", async () => {
      await renderLoaded();

      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
      expect(screen.getByText("Bagian Statistik")).toBeInTheDocument();
    });
  });

  describe("ringkasan metrik", () => {
    it("menghitung total, hilang, ditemukan, dan selesai", async () => {
      await renderLoaded();

      expect(summaryValue("Total")).toHaveTextContent("4");
      expect(summaryValue("Barang Hilang")).toHaveTextContent("2");
      expect(summaryValue("Barang Ditemukan")).toHaveTextContent("2");
      expect(summaryValue("Selesai")).toHaveTextContent("2");
    });

    it("menampilkan nol jika belum ada laporan", async () => {
      await renderLoaded({ state: { lostFounds: [] } });

      expect(summaryValue("Total")).toHaveTextContent("0");
      expect(summaryValue("Selesai")).toHaveTextContent("0");
    });

    it("tidak berubah ketika filter diterapkan", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.type(screen.getByLabelText("Cari laporan"), "dompet");

      expect(cardTitles()).toEqual(["Dompet hitam"]);
      expect(summaryValue("Total")).toHaveTextContent("4");
    });
  });

  describe("daftar laporan", () => {
    it("menampilkan semua laporan sebagai kartu bertautan ke halaman detail", async () => {
      await renderLoaded();

      expect(cardTitles()).toEqual(["Dompet hitam", "Kunci motor", "Payung biru", "Tas ransel"]);
      expect(screen.getByRole("link", { name: /Dompet hitam/ })).toHaveAttribute(
        "href",
        "/lost-founds/1"
      );
      expect(screen.getByText("Hilang di kantin lantai 2")).toBeInTheDocument();
    });

    it("menampilkan cover jika ada dan ikon pengganti jika tidak ada", async () => {
      await renderLoaded();

      expect(screen.getByRole("img", { name: "Dompet hitam" })).toHaveAttribute(
        "src",
        "https://img.test/dompet.png"
      );
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    it("menampilkan badge jenis dan badge selesai sesuai data", async () => {
      await renderLoaded();

      const dompet = screen.getByRole("link", { name: /Dompet hitam/ });
      expect(within(dompet).getByText("Hilang")).toBeInTheDocument();
      expect(within(dompet).queryByText("Selesai")).not.toBeInTheDocument();

      const kunci = screen.getByRole("link", { name: /Kunci motor/ });
      expect(within(kunci).getByText("Ditemukan")).toBeInTheDocument();
      expect(within(kunci).getByText("Selesai")).toBeInTheDocument();
    });

    it.each([
      ["objek", "Dompet hitam", /Budi · .*Oktober 2026/],
      ["teks", "Kunci motor", /Siti · .*Oktober 2026/],
      ["kosong", "Payung biru", /^- · -$/],
      ["tanpa nama", "Tas ransel", /^- · .*Oktober 2026/],
    ])("menampilkan pelapor dan tanggal untuk pelapor berupa %s", async (_name, title, pattern) => {
      await renderLoaded();

      const card = screen.getByRole("link", { name: new RegExp(title) });
      expect(within(card).getByText(pattern)).toBeInTheDocument();
    });

    it("menampilkan pesan kosong jika belum ada laporan", async () => {
      await renderLoaded({ state: { lostFounds: [] } });

      expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
    });
  });

  describe("pencarian", () => {
    it("mencari berdasarkan judul tanpa peka huruf besar/kecil", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.type(screen.getByLabelText("Cari laporan"), "KUNCI");

      expect(cardTitles()).toEqual(["Kunci motor"]);
    });

    it("mencari berdasarkan deskripsi", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.type(screen.getByLabelText("Cari laporan"), "perpustakaan");

      expect(cardTitles()).toEqual(["Payung biru"]);
    });

    it("mengabaikan spasi di awal/akhir kata kunci", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.type(screen.getByLabelText("Cari laporan"), "   ");

      expect(cardTitles()).toHaveLength(4);
    });

    it("menampilkan pesan kosong jika tidak ada yang cocok", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.type(screen.getByLabelText("Cari laporan"), "zzzz");

      expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
    });

    it("tetap aman jika laporan tidak punya judul/deskripsi", async () => {
      const user = userEvent.setup();
      await renderLoaded({ state: { lostFounds: [{ id: "9", status: "lost" }] } });

      await user.type(screen.getByLabelText("Cari laporan"), "abc");

      expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
    });
  });

  describe("filter jenis", () => {
    it("menandai tab 'Semua' sebagai aktif secara bawaan", async () => {
      await renderLoaded();

      expect(screen.getByRole("button", { name: "Semua" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "Hilang" })).toHaveAttribute("aria-pressed", "false");
    });

    it("menyaring laporan hilang", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.click(screen.getByRole("button", { name: "Hilang" }));

      expect(cardTitles()).toEqual(["Dompet hitam", "Payung biru"]);
      expect(screen.getByRole("button", { name: "Hilang" })).toHaveAttribute("aria-pressed", "true");
    });

    it("menyaring laporan ditemukan", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.click(screen.getByRole("button", { name: "Ditemukan" }));

      expect(cardTitles()).toEqual(["Kunci motor", "Tas ransel"]);
    });

    it("kembali menampilkan semua saat 'Semua' dipilih lagi", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.click(screen.getByRole("button", { name: "Hilang" }));
      await user.click(screen.getByRole("button", { name: "Semua" }));

      expect(cardTitles()).toHaveLength(4);
    });
  });

  describe("filter penyelesaian", () => {
    it("menampilkan hanya laporan yang selesai", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.selectOptions(screen.getByLabelText("Filter penyelesaian"), "1");

      expect(cardTitles()).toEqual(["Kunci motor", "Payung biru"]);
    });

    it("menampilkan hanya laporan yang masih dalam proses", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.selectOptions(screen.getByLabelText("Filter penyelesaian"), "0");

      expect(cardTitles()).toEqual(["Dompet hitam", "Tas ransel"]);
    });

    it("kembali menampilkan semua saat 'Semua status' dipilih", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      await user.selectOptions(screen.getByLabelText("Filter penyelesaian"), "1");
      await user.selectOptions(screen.getByLabelText("Filter penyelesaian"), "");

      expect(cardTitles()).toHaveLength(4);
    });
  });

  it("menggabungkan filter jenis, penyelesaian, dan pencarian", async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole("button", { name: "Hilang" }));
    await user.selectOptions(screen.getByLabelText("Filter penyelesaian"), "1");
    expect(cardTitles()).toEqual(["Payung biru"]);

    await user.type(screen.getByLabelText("Cari laporan"), "dompet");
    expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
  });

  describe("laporan saya", () => {
    it("meminta ulang data dengan is_me=1 saat dicentang dan params kosong saat dilepas", async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const checkbox = screen.getByLabelText("Laporan saya");
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      await waitFor(() => expect(asyncSetLostFounds).toHaveBeenLastCalledWith({ is_me: 1 }));
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      await waitFor(() => expect(asyncSetLostFounds).toHaveBeenLastCalledWith({}));
      expect(asyncSetLostFounds).toHaveBeenCalledTimes(3);
    });
  });

  describe("tambah laporan", () => {
    it("membuka dan menutup modal tambah laporan", async () => {
      const user = userEvent.setup();
      await renderLoaded();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /Tambah Laporan/ }));
      expect(screen.getByRole("dialog", { name: "Tambah Laporan" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Batal" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("menutup modal dan memuat ulang daftar setelah laporan berhasil ditambahkan", async () => {
      asyncSetIsLostFoundAdd.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_ADDED", payload: { status: true } });
      });
      const user = userEvent.setup();
      await renderLoaded();

      await user.click(screen.getByRole("button", { name: /Tambah Laporan/ }));
      await user.type(screen.getByLabelText("Judul"), "Jam tangan");
      await user.type(screen.getByLabelText("Deskripsi"), "Hilang di lapangan");
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(asyncSetIsLostFoundAdd).toHaveBeenCalledWith({
        title: "Jam tangan",
        description: "Hilang di lapangan",
        status: "lost",
      });
      expect(asyncSetLostFounds).toHaveBeenCalledTimes(2);
    });
  });

  describe("navigasi ke statistik", () => {
    it("menggulir ke bagian statistik jika URL memakai #statistik", async () => {
      await renderLoaded({ route: "/#statistik" });

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    });

    it("tidak menggulir jika tidak ada hash", async () => {
      await renderLoaded({ route: "/" });

      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });

    it("tidak menggulir untuk hash lain", async () => {
      await renderLoaded({ route: "/#lainnya" });

      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });
  });
});