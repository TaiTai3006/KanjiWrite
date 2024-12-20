// Tạo biểu đồ khi tài liệu đã được tải xong
const ctx = document.getElementById("myLineChart").getContext("2d");

// Khởi tạo biểu đồ

const currentDate = new Date();

// Lấy năm hiện tại
const year = currentDate.getFullYear();

// Lấy tháng hiện tại (tháng bắt đầu từ 0, vì vậy cần cộng thêm 1)
const month = currentDate.getMonth() + 1;

const filter_month_input = document.getElementById("filter-month");
const filter_year_input = document.getElementById("filter-year");
const filter_user_select = document.getElementById("filter-user");

window.addEventListener("load", function () {
  filter_month_input.value = month;
  filter_year_input.value = year;
  filter_user_select.value = "day";
  handle_show_char()
});

const handle_show_char = async () => {
  try {
    let type = filter_user_select.value;
    let month = filter_month_input.value;
    let year = filter_year_input.value;

    const axiosResponse = await axios.get(`https://kanji-write-server.vercel.app/get-char-user?type=${type}&month=${month}&year=${year}`);
    add_char(axiosResponse.data)
  } catch (error) {
    console.error("Error posting to server:", error.response?.data || error.message);
  }
};
let myLineChart;

const add_char =  (data) => {

  if (myLineChart) {
    myLineChart.destroy();
  }

  myLineChart = new Chart(ctx, {
    type: "line", // Loại biểu đồ: 'line' cho biểu đồ đường
    data: {
      labels: data.labels, // Các nhãn cho từng điểm
      datasets: [
        {
          label: "Số lượng người truy cập",
          data: data.data, // Dữ liệu biểu đồ
          fill: false, // Không tô màu phía dưới đường
          borderColor: "rgba(75, 192, 192, 1)", // Màu đường
          tension: 0.1, // Độ cong của đường
          borderWidth: 2, // Độ dày của đường
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true, // Bắt đầu trục Y từ 0
        },
      },
    },
  });
};
