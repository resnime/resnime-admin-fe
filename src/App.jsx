import { ConfigProvider, Layout, Spin, Typography, message, theme } from "antd";
import { useState, useEffect, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import Home from "./pages/home/Home.jsx";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

export default function App() {
  const [messageApi, contextHolder] = message.useMessage();

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout className="app-shell">
        {contextHolder}
        <Content className="container">
          <header className="header">
            <Title>Resnime Admin Importer</Title>
            <Paragraph>
              Tool admin untuk mengambil data MyAnimeList dan mereview hasilnya
              secara manual sebelum masuk database.
            </Paragraph>
          </header>

          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <Spin size="large" tip="Loading..." />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home messageApi={messageApi} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
