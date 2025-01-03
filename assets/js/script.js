var kuroshiro = new Kuroshiro();
kuroshiro
  .init(new KuromojiAnalyzer({ dictPath: "/dict" }))
  .then(function () {
    console.log("initialized kuroshiro successfully!");
  })
  .catch(function (error) {
    console.error(error);
  });

const loading_create = document.getElementById("loading-create");

const number_of_boxes = document.getElementById("number-of-boxes");
const number_of_blurred_letters = document.getElementById(
  "number-of-blurred-letters"
);

const a4_wirte = document.getElementById("a4-wirte");
console.log(a4_wirte);

number_of_boxes.addEventListener("input", function (event) {
  // submitKanji(event);
  number_of_blurred_letters.max = number_of_boxes.value;
});

async function handleKuroshiro(kanji, type) {
  try {
    // console.log(kanji);
    let kanji_reading;
    if (type === 1) {
      kanji_reading = await kuroshiro.convert(kanji, { to: "hiragana" });
    } else {
      kanji_reading = await kuroshiro.convert(kanji, {
        mode: "furigana",
        to: "hiragana",
      });
    }
    // console.log(kanji_reading);
    return kanji_reading;
  } catch (error) {
    console.error("Error:", error);
    return "";
  }
}

const fileInput = document.getElementById("excel-file");

fileInput.addEventListener("change", readFileExcel);

function readFileExcel() {
  if (fileInput.files.length === 0) {
    return;
  }

  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    const data = event.target.result;
    const workbook = XLSX.read(data, { type: "binary" });

    // Chọn sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Chuyển dữ liệu sheet thành mảng JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Xử lý dữ liệu theo định dạng yêu cầu
    const formattedData = jsonData
      .map((row) => {
        return `${row.Kanji} (${row.Mean ? row.Mean : ""}) ${
          row.Example ? row.Example : ""
        }`;
      })
      .join("\n");

    // Hiển thị kết quả
    document.getElementById("kanji-input").value = formattedData;
    sessionStorage.setItem("kanji-input-backup", formattedData);
    handle_check_textarea()
  };

  reader.onerror = function (error) {
    outputElement.textContent = "Đã xảy ra lỗi khi đọc file!";
  };

  reader.readAsBinaryString(file);
}

document
  .getElementById("dowm-template-file")
  .addEventListener("click", downloadExcel);
document.getElementById("print").addEventListener("click", function () {
  window.print();
});

function downloadExcel() {
  // Dữ liệu chỉ có tiêu đề
  const data = [{ Kanji: "Kanji", Mean: "Mean", Example: "Example" }];

  // Tạo WorkSheet từ dữ liệu
  const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

  // Tạo WorkBook và thêm WorkSheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Xuất file Excel
  const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // Hàm chuyển dữ liệu sang dạng Blob
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length); // Tạo buffer
    const view = new Uint8Array(buf); // Tạo view để ghi dữ liệu
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  // Tạo link để tải file
  const blob = new Blob([s2ab(excelFile)], {
    type: "application/octet-stream",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Kanji_Template.xlsx"; // Tên file tải xuống
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const kanji_container = document.getElementById("kanji-container");
const a4 = document.getElementById("a4");

function checkAndProcessString(input) {
  const hasParentheses = /\(.*\)/.test(input);

  if (!hasParentheses) {
    const processedInput = input
      .split(" ")
      .map((word) => word + " ()")
      .join(" ");
    return processedInput;
  }
}

const kanji_warring_div = document.getElementsByClassName("kanji-warring")[0]
const kanji_tools__button_bottom_div = document.getElementsByClassName("kanji-tools__button-bottom")[0];
const kanji_tools__button_top_div = document.getElementsByClassName("kanji-tools__button-top")[0];
const loading_kanji_preview_div = document.getElementsByClassName("loading-kanji-preview")[0];

const submitKanji = async function (event) {
  event.preventDefault(); // Ngăn form tải lại trang
  deleteKanji();

  const kanjiInput = document.getElementById("kanji-input").value;
  // console.log(kanjiInput);
  if (kanjiInput.length === 0) {
    document.getElementById("result").textContent = "Vui lòng nhập chữ Kanji!";
    return;
  }

  kanji_warring_div.classList.add("none")
  kanji_tools__button_bottom_div.classList.add("none")
  kanji_tools__button_top_div.classList.add("none")
  loading_kanji_preview_div.classList.remove("none")


  let arrKanji = kanjiInput.split("\n");

  for (let i = 0; i < arrKanji.length; i++) {
    const kanji = arrKanji[i].split(" ")[0];
    const match = arrKanji[i].match(/^(\S+)\s*\((.*?)\)\s*(.*)$/);

    arrKanji[i] = {
      kanji: kanji,
      reading: await handleKuroshiro(kanji, 1),
      meaning: match && match[2] ? match[2] : "",
      example: arrKanji[i].split(" ").length !== 1 && !arrKanji[i]
        .split(" ")
        [arrKanji[i].split(" ").length - 1].includes(")")
        ? await handleKuroshiro(
            arrKanji[i].split(" ")[arrKanji[i].split(" ").length - 1],
            2
          )
        : "",
      unicodeList: kanji
        .split("")
        .map((data) => data.codePointAt(0).toString(16)),
    };
  }
  // console.log(arrKanji);

  // loading_create.textContent = "";
  // loading_create.classList.add("fui-loading-spinner");

  await fetchKanji(arrKanji);

  kanji_warring_div.classList.remove("none")
  kanji_tools__button_bottom_div.classList.remove("none")
  kanji_tools__button_top_div.classList.remove("none")
  loading_kanji_preview_div.classList.add("none")
};

const createunicode = function (list) {
  for (let i = 0; i < list.length; i) {
    list[i] = list[i].codePointAt(0).toString(16);
  }
};

function cleanSVG(svgString) {
  // Tìm cặp thẻ <svg> và </svg> bằng regex
  const cleanedSVG = svgString.match(/<svg[^>]*>.*<\/svg>/s);
  return cleanedSVG ? cleanedSVG[0] : "";
}

let isRunning = false;

const fetchKanji = async function (svgUrl_list) {
  try {
    isRunning = true;
    // console.log(svgUrl_list);
    for (let index = 0; index < svgUrl_list.length; index++) {
      if(!isRunning) return

      
      const div_kanji_box_container = document.createElement("div");
      div_kanji_box_container.classList.add("kanji-box-container");
      a4_wirte.appendChild(div_kanji_box_container);

      const div_kanji_box_write = document.createElement("div");
      div_kanji_box_write.classList.add("kanji-box-write");

      const div_title = document.createElement("div");
      div_title.classList.add("title");

      const div_title_svg_list = document.createElement("div");
      div_title_svg_list.classList.add("title-svg-list");

      const div_title__right = document.createElement("div");
      div_title__right.classList.add("title__right");

      div_kanji_box_container.appendChild(div_title);
      div_kanji_box_container.appendChild(div_kanji_box_write);

      div_title.appendChild(div_title_svg_list);

      div_title.appendChild(div_title__right);

      //set div_title__right

      const h3 = document.createElement("h3");
      h3.textContent = svgUrl_list[index].reading;

      const h4 = document.createElement("h4");
      h4.textContent = svgUrl_list[index].meaning;

      const p = document.createElement("p");
      p.innerHTML = svgUrl_list[index].example
        ? svgUrl_list[index].example
        : "";

      div_title__right.appendChild(h3);
      div_title__right.appendChild(h4);
      div_title__right.appendChild(p);

      //set the title
      for (let i = 0; i < svgUrl_list[index].unicodeList.length; i++) {
        const item = svgUrl_list[index].unicodeList[i];

        const response = await fetch(
          `https://kanjivg.tagaini.net/kanjivg/kanji/0${item}.svg`
        );
        if (!response.ok) throw new Error("SVG not found");

        const svgData = await response.text();

        const div = document.createElement("div");
        div.classList.add("kanji-svg-" + (index + 1));
        div.innerHTML = cleanSVG(svgData);

        div_title_svg_list.appendChild(div);
      }

      //set kanji box
      let temp = 1;
      while (temp <= number_of_boxes.value) {
        for (let i = 0; i < svgUrl_list[index].kanji.length; i++) {
          const div = document.createElement("div");
          div.classList.add(`kanji-box`);
          if (temp <= number_of_blurred_letters.value) {
            div.textContent = svgUrl_list[index].kanji[i];
          }
          div_kanji_box_write.appendChild(div);
        }

        temp++;
      }

      // const paths = document.querySelectorAll("path");
      // paths.forEach((path) => (path.style.display = "none")); // Ẩn tất cả nét

      // let i = 0;
      // function animateStroke() {
      //   if (i < paths.length) {
      //     paths[i].style.display = "block"; // Hiện nét
      //     i++;
      //     setTimeout(animateStroke, 500); // Thời gian chờ giữa các nét
      //   }
      // }
      // animateStroke(); // Bắt đầu hiệu ứng
    
    }
  } catch (error) {
    console.error("Error loading Kanji SVG:", error);
    kanji_warring_div.classList.remove("none")
    kanji_tools__button_bottom_div.classList.remove("none")
    kanji_tools__button_top_div.classList.remove("none")
    loading_kanji_preview_div.classList.add("none")
    deleteKanji()
    alert("Error loading Kanji SVG: ", error);
  }
};

document.getElementById("kanji-form").addEventListener("click", submitKanji);
const deleteKanji = function () {
  while (a4_wirte.firstChild) {
    a4_wirte.removeChild(a4_wirte.firstChild); // Loại bỏ thẻ con đầu tiên
  }
};
document.getElementById("delete-input").addEventListener("click", deleteKanji);

const kanji_tools = document.getElementById("kanji-tools");
window.onbeforeprint = () => {
  kanji_tools.style.display = "none";

  let children = a4_wirte.children;
  console.log(children, "children");
  const header_background = document.getElementById("a4-header-background");

  let height_max = getBrowserHeightA4();
  let height_sum = header_background.getBoundingClientRect().height + 10;

  for (let i = 0; i < children.length; i++) {
    const childHeight = children[i].getBoundingClientRect().height;
    height_sum += childHeight;
    const childHeight_continue = children[i + 1].getBoundingClientRect().height;

    if (height_sum + childHeight_continue >= height_max) {
      children[i].style.marginBottom = `${height_max - height_sum}px`;
      console.log("add space", children[i]);
      height_sum = 0;
    }
  }
};

// Bắt sự kiện đóng cửa sổ in
window.onafterprint = () => {
  kanji_tools.style.display = "flex";
  let children = a4_wirte.children;
  for (chil of children) {
    chil.style.marginBottom = 0;
  }
};

const title_input = document.getElementById("title-input");
const a4_title = document.getElementById("a4-title");

title_input.addEventListener("input", () => {
  a4_title.textContent = title_input.value;
});

function getBrowserHeightA4() {
  const userAgent = navigator.userAgent;

  if (
    userAgent.includes("Chrome") &&
    !userAgent.includes("Edg") &&
    !userAgent.includes("OPR")
  ) {
    return 1040;
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return 978; //975
  } else if (userAgent.includes("Firefox")) {
    return 0;
  } else if (userAgent.includes("Edg")) {
    return 0;
  } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
    return 0;
  } else {
    return 0;
  }
}

const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Hiển thị nút khi cuộn xuống
window.onscroll = function () {
  if (document.documentElement.scrollTop > 200) {
    // Khi cuộn hơn 200px
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

// Hàm cuộn lên đầu trang
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Hiệu ứng mượt
  });
}

const font_size_box_select = document.getElementById("font-size-box");
const style_fontsize = document.createElement("style");
const style_transcription = document.createElement("style");

font_size_box_select.addEventListener("change", function () {
  setFontSize()
});

const setFontSize = ()=>{
  let font_size = font_size_box_select.value;
  console.log(font_size)
  if (font_size === "small") {
    font_size = 25 + "px";
  } else if (font_size === "medium") {
    font_size = 30 + "px";
  } else {
    font_size = 35 + "px";
  }
  console.log(font_size)
  style_fontsize.textContent = `.kanji-box { font-size: ${font_size}; }`;
  document.head.appendChild(style_fontsize);
}



const toggle_input = document.getElementById("toggle-input");

toggle_input.addEventListener("change", () => {
  setTranscription()
});

const setTranscription = () =>{
  if (toggle_input.checked) {
    style_transcription.textContent = `.title__right h3 { display: block; }`;
  } else {
    style_transcription.textContent = `.title__right h3 { display: none; }`;
  }
  document.head.appendChild(style_transcription);
}

const processText = (input) => {
  // Tách các dòng
  const lines = input.split("\n");

  const processedLines = lines.map((line) => {
    // Tách các từ dựa trên dấu cách
    const words = line.split(" ");

    // Nếu dòng có ít nhất một từ (Kanji) và không phải dòng trống
    if (words.length > 0) {
      words.splice(1, 0, ","); // Thêm dấu phẩy sau từ Kanji đầu tiên
    }

    // Ghép lại các từ thành một chuỗi
    return words.join(" ");
  });

  // Kết hợp lại thành chuỗi kết quả
  return processedLines.join("\n");
};

const handleCopyForQuizlet = () => {
  let kanjiInput = document.getElementById("kanji-input").value;
  if (kanjiInput.length === 0) {
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = processText(kanjiInput);
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  alert("Copied to clipboard for Quizlet!");
};

// Tạo các sao lưu cho setting và backup dữ liệu khi reload

let setting = {
  number_box: 3,
  number_of_blurred_letters: 1,
  font_size: "medium",
  transcription: true,
};

window.addEventListener("load", function () {
  const savedSetting = JSON.parse(localStorage.getItem("setting"));
  const saveKanjiBackup = sessionStorage.getItem("kanji-input-backup");

  if (savedSetting) {
    setting = savedSetting;
  }

  if (saveKanjiBackup) {
    document.getElementById("kanji-input").value = saveKanjiBackup;
  }

  number_of_boxes.value = setting.number_box;
  number_of_blurred_letters.value = setting.number_of_blurred_letters;
  font_size_box_select.value = setting.font_size;
  toggle_input.checked = setting.transcription;

  handle_check_textarea()
  setFontSize()
  setTranscription()
});

const handle_setting_change = (event) => {
  const { name, type, checked, value } = event.target;

  const inputValue = type === "checkbox" ? checked : value;

  setting = { ...setting, [name]: inputValue };

  localStorage.setItem("setting", JSON.stringify(setting));
  
};

const handle_input_kanji_change = () => {
  sessionStorage.setItem(
    "kanji-input-backup",
    document.getElementById("kanji-input").value
  );
  handle_check_textarea()
};

//chức năng xoá cho textarea
const icon_delete_header = document.getElementsByClassName("icon-delete")[0];

const handle_check_textarea = () => {
  document.getElementById("kanji-input").value
  ? icon_delete_header.classList.remove("none")
  : icon_delete_header.classList.add("none");
}

const handle_delete_textarea = () => {
  document.getElementById("kanji-input").value = "";
  icon_delete_header.classList.add("none");
}

const hanlde_cancel_loading = () => {
  isRunning = false;
  deleteKanji();
  kanji_warring_div.classList.remove("none")
  kanji_tools__button_bottom_div.classList.remove("none")
  kanji_tools__button_top_div.classList.remove("none")
  loading_kanji_preview_div.classList.add("none")
}

document.addEventListener("DOMContentLoaded", async function () {
  // Fetch the IP address from the API
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    const res1 = await fetch("https://api.db-ip.com/v2/free/self");
    const data1 = await res1.json();

    console.log(data1);

    console.log(data.ip);

    try {
      const axiosResponse = await axios.post(`https://kanji-write-server.vercel.app/add-user?ip=${data.ip}&city=${data1.city}`);
      console.log("Response from server:", axiosResponse.data);
    } catch (error) {
      console.error("Error posting to server:", error.response?.data || error.message);
    }
  } catch (error) {
    console.error("Error fetching IP address:", error);
  }
});

