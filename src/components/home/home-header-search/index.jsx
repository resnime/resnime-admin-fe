import { Button, Card, Form, InputNumber, Space, message } from "antd";
import { SearchOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useState } from "react";
import HomeHeaderSearchModalTursoData from "./HomeHeaderSearchModalTursoData.jsx";
import { fetchAllAnimeFromTurso } from "../../../services/animeApi.js";
import { useHomeCtx } from "../../../context/HomeCtxProvider.jsx";

export default function HomeHeaderSearch() {
  const {
    scrapeForm,
    handleScrape: onScrape,
    loading: isScraping,
    handleFetchFromTurso: onFetchFromTurso,
  } = useHomeCtx();


  const [modalOpen, setModalOpen] = useState(false);
  const [tursoData, setTursoData] = useState([]);
  const [fetching, setFetching] = useState(false);

  const handleFetchTursoData = async () => {
    setFetching(true);
    try {
      const result = await fetchAllAnimeFromTurso();
      setTursoData(result.data || []);
      setModalOpen(true);
    } catch (error) {
      message.error(error.message);
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      <Card className="scrape-card">
        <Form
          form={scrapeForm}
          layout="inline"
          onFinish={onScrape}
          className="scrape-form"
        >
          <Form.Item
            label="MyAnimeList ID"
            name="malId"
            rules={[
              { required: true, message: "Masukkan MyAnimeList ID." },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "")
                    return Promise.resolve();
                  return Number.isInteger(Number(value)) && Number(value) > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("ID harus angka positif."));
                },
              },
            ]}
          >
            <InputNumber
              min={1}
              precision={0}
              controls={false}
              className="mal-input"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isScraping}
                icon={<SearchOutlined />}
              >
                Scrape Anime
              </Button>
              <Button
                type="default"
                onClick={handleFetchTursoData}
                loading={fetching}
                icon={<DatabaseOutlined />}
              >
                Show All Turso Data
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <HomeHeaderSearchModalTursoData
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        data={tursoData}
        loading={fetching}
        onRowClick={(record) => {
          onFetchFromTurso(record.id);
          setModalOpen(false);
        }}
      />
    </>
  );
}
