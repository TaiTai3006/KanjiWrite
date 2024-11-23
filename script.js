var kuroshiro = new Kuroshiro();
kuroshiro
  .init(new KuromojiAnalyzer({ dictPath: "/dict" }))
  .then(function () {
    console.log("initialized kuroshiro successfully!");
  })
  .catch(function (error) {
    console.error(error);
  });

const number_of_boxes = document.getElementById("number-of-boxes");
const number_of_blurred_letters = document.getElementById(
  "number-of-blurred-letters"
);

const a4_wirte =  document.getElementById("a4-wirte")
console.log(a4_wirte)

number_of_boxes.addEventListener("input", function (event) {
  submitKanji(event);
  number_of_blurred_letters.max = number_of_boxes.value;
});

number_of_blurred_letters.addEventListener("input", function (event) {
  submitKanji(event);
});

async function handleKuroshiro(kanji, type) {
  try {
    console.log(kanji);
    let kanji_reading;
    if (type === 1) {
      kanji_reading = await kuroshiro.convert(kanji, { to: "hiragana" });
    } else {
      kanji_reading = await kuroshiro.convert(kanji, {
        mode: "furigana",
        to: "hiragana",
      });
    }
    console.log(kanji_reading);
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
        return `${row.Kanji} (${row.Mean}) ${row.Example}`;
      })
      .join("\n");

    // Hiển thị kết quả
    document.getElementById("kanji-input").value = formattedData;
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

const submitKanji = async function (event) {
  event.preventDefault(); // Ngăn form tải lại trang
  deleteKanji();

  const kanjiInput = document.getElementById("kanji-input").value;
  // console.log(kanjiInput);
  if (kanjiInput.length === 0) {
    document.getElementById("result").textContent = "Vui lòng nhập chữ Kanji!";
    return;
  }

  let arrKanji = kanjiInput.split("\n");

  for (let i = 0; i < arrKanji.length; i++) {
    const kanji = arrKanji[i].split(" ")[0];
    const match = arrKanji[i].match(/^(\S+)\s*\((.*?)\)\s*(.*)$/);
    arrKanji[i] = {
      kanji: kanji,
      reading: await handleKuroshiro(kanji, 1),
      meaning: match && match[2] ? match[2]: "",
      example: await handleKuroshiro(
        arrKanji[i].split(" ")[arrKanji[i].split(" ").length - 1],
        2
      ),
      unicodeList: kanji
        .split("")
        .map((data) => data.codePointAt(0).toString(16)),
    };
  }
  console.log(arrKanji);

  fetchKanji(arrKanji);
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

const fetchKanji = async function (svgUrl_list) {
  try {
    // console.log(svgUrl_list);
    for (let index = 0; index < svgUrl_list.length; index++) {
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
    document.getElementById("result").textContent =
      "Không tìm thấy SVG cho chữ Kanji này!";
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
};

// Bắt sự kiện đóng cửa sổ in
window.onafterprint = () => {
  kanji_tools.style.display = "flex";
};

const title_input = document.getElementById("title-input");
const a4_title = document.getElementById("a4-title");

title_input.addEventListener("input", () => {
  a4_title.textContent = title_input.value;
});
