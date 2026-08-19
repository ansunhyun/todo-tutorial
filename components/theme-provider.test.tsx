import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";

// jsdom은 matchMedia를 구현하지 않아 next-themes의 시스템 테마 감지가 실패한다.
beforeEach(() => {
  // next-themes가 localStorage에 저장한 테마가 테스트 간에 남아있지 않도록 한다.
  localStorage.clear();
  document.documentElement.classList.remove("dark", "light");
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

function ThemeDisplay() {
  const { resolvedTheme } = useTheme();
  return <span>테마: {resolvedTheme}</span>;
}

function renderWithTheme() {
  return render(
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <ThemeDisplay />
    </ThemeProvider>
  );
}

describe("ThemeProvider 단축키(d)", () => {
  it("'d' 키를 누르면 라이트에서 다크로 전환된다", async () => {
    renderWithTheme();
    await waitFor(() => expect(screen.getByText("테마: light")).toBeInTheDocument());

    fireEvent.keyDown(window, { key: "d" });

    await waitFor(() =>
      expect(screen.getByText("테마: dark")).toBeInTheDocument()
    );
  });

  it("input에 포커스가 있을 때는 'd'를 눌러도 테마가 바뀌지 않는다", async () => {
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <input aria-label="검색" />
        <ThemeDisplay />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByText("테마: light")).toBeInTheDocument());

    screen.getByLabelText("검색").focus();
    fireEvent.keyDown(screen.getByLabelText("검색"), { key: "d" });

    expect(screen.getByText("테마: light")).toBeInTheDocument();
  });

  it("Ctrl+d처럼 수정키가 함께 눌리면 테마가 바뀌지 않는다", async () => {
    renderWithTheme();
    await waitFor(() => expect(screen.getByText("테마: light")).toBeInTheDocument());

    fireEvent.keyDown(window, { key: "d", ctrlKey: true });

    expect(screen.getByText("테마: light")).toBeInTheDocument();
  });

  it("키 반복 입력(repeat)은 무시된다", async () => {
    renderWithTheme();
    await waitFor(() => expect(screen.getByText("테마: light")).toBeInTheDocument());

    fireEvent.keyDown(window, { key: "d", repeat: true });

    expect(screen.getByText("테마: light")).toBeInTheDocument();
  });

  it("'d' 이외의 키는 테마를 바꾸지 않는다", async () => {
    renderWithTheme();
    await waitFor(() => expect(screen.getByText("테마: light")).toBeInTheDocument());

    fireEvent.keyDown(window, { key: "a" });

    expect(screen.getByText("테마: light")).toBeInTheDocument();
  });
});
