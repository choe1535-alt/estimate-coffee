(function () {
  const data = window.COFFEE24_DATA;
  const form = document.getElementById("quote-form");
  const preview = document.getElementById("quote-preview");
  const beanRows = document.getElementById("bean-rows");
  const beanTemplate = document.getElementById("bean-row-template");

  const salesRepSelect = form.elements.salesRep;
  const machineSelect = form.elements.machineName;
  const careSelect = form.elements.careCycle;
  const quoteDateInput = form.elements.quoteDate;

  const priceMap = new Map(
    data.machinePrices.map((item) => [`${item.machine}|${item.term}|${item.beansIncluded}`, item.price])
  );
  const machineMap = new Map(data.machines.map((item) => [item.name, item]));
  const beanMap = new Map(data.beans.map((item) => [item.name, item]));
  const repMap = new Map(data.salesReps.map((item) => [item.name, item]));
  const careMap = new Map(data.careCycles.map((item) => [item.cycle, item.extra]));

  function formatMoney(value) {
    if (value == null || Number.isNaN(value)) {
      return "문의";
    }
    return `${Math.round(value).toLocaleString("ko-KR")}원`;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function nl2br(value) {
    return escapeHtml(value).replaceAll("\n", "<br />");
  }

  function todayInputValue() {
    const now = new Date();
    const tz = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 10);
  }

  function populateSelect(select, values, picker) {
    select.innerHTML = values
      .map((item) => `<option value="${escapeHtml(picker(item).value)}">${escapeHtml(picker(item).label)}</option>`)
      .join("");
  }

  function createBeanRow(beanName, quantity) {
    const fragment = beanTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".bean-row");
    const select = row.querySelector("[data-bean-name]");
    const qty = row.querySelector("[data-bean-qty]");

    populateSelect(select, data.beans, (item) => ({ value: item.name, label: `${item.name} · ${item.brand}` }));
    select.value = beanName || data.beans[0].name;
    qty.value = quantity ?? 1;

    row.querySelector("[data-bean-remove]").addEventListener("click", () => {
      row.remove();
      render();
    });

    select.addEventListener("change", render);
    qty.addEventListener("input", render);
    beanRows.appendChild(row);
  }

  function readBeanRows() {
    return Array.from(beanRows.querySelectorAll(".bean-row"))
      .map((row) => ({
        name: row.querySelector("[data-bean-name]").value,
        quantity: Math.max(0, Number(row.querySelector("[data-bean-qty]").value || 0)),
      }))
      .filter((item) => item.quantity > 0);
  }

  function getFormState() {
    const theme = form.elements.theme.value;
    const quoteDate = new Date(`${quoteDateInput.value}T00:00:00`);
    const machineName = form.elements.machineName.value;
    const machine = machineMap.get(machineName);
    const machineQuantity = Math.max(1, Number(form.elements.machineQuantity.value || 1));
    const contractTerm = Number(form.elements.contractTerm.value);
    const careCycle = form.elements.careCycle.value;
    const machineDiscount = Number(form.elements.machineDiscount.value || 0) / 100;
    const beanDiscount = Number(form.elements.beanDiscount.value || 0) / 100;
    const beansEnabled = form.elements.beansEnabled.value === "yes";
    const shippingMode = form.elements.shippingMode.value;
    const purchaseInstall = form.elements.purchaseInstall.value === "yes";
    const beanItems = beansEnabled ? readBeanRows() : [];
    const salesRep = repMap.get(form.elements.salesRep.value);

    return {
      theme,
      companyName: form.elements.companyName.value.trim(),
      contactName: form.elements.contactName.value.trim(),
      contactPhone: form.elements.contactPhone.value.trim(),
      contactEmail: form.elements.contactEmail.value.trim(),
      quoteDate,
      salesRep,
      machine,
      machineQuantity,
      contractTerm,
      careCycle,
      machineDiscount,
      beanDiscount,
      beansEnabled,
      shippingMode,
      purchaseInstall,
      beanItems,
    };
  }

  function buildLineItem({ type, productName, itemName, term, quantity, unit, listPrice, discountPrice }) {
    const amount = discountPrice == null ? null : discountPrice * quantity;
    return {
      type,
      productName,
      itemName,
      term,
      quantity,
      unit,
      listPrice,
      discountPrice,
      amount,
    };
  }

  function computeQuote(state) {
    const vatRate = data.constants.vatRate;
    const validUntil = new Date(state.quoteDate);
    validUntil.setDate(validUntil.getDate() + data.constants.quoteValidDays);

    const rentalUnit = priceMap.get(`${state.machine.name}|${state.contractTerm}|X`);
    const bundleUnit = priceMap.get(`${state.machine.name}|${state.contractTerm}|O`);
    const discountedRentalUnit = rentalUnit == null ? null : Math.round(rentalUnit * (1 - state.machineDiscount));
    const discountedBundleUnit = bundleUnit == null ? null : Math.round(bundleUnit * (1 - state.machineDiscount));
    const discountedPurchaseUnit =
      state.machine.purchasePrice == null
        ? null
        : Math.round(state.machine.purchasePrice * (1 - state.machineDiscount));

    const careExtraUnit = careMap.get(state.careCycle) ?? 0;
    const careLine =
      state.beansEnabled && careExtraUnit > 0
        ? buildLineItem({
            type: "케어서비스",
            productName: "머신 케어",
            itemName: `${state.careCycle} 머신 케어 추가`,
            term: `${state.contractTerm}개월`,
            quantity: state.machineQuantity,
            unit: "EA",
            listPrice: careExtraUnit,
            discountPrice: careExtraUnit,
          })
        : null;

    const beanLines = state.beanItems.map((item) => {
      const bean = beanMap.get(item.name);
      const discountedPrice = Math.round(bean.price * (1 - state.beanDiscount));
      return buildLineItem({
        type: "원두 정기구독",
        productName: `${bean.brand} 원두`,
        itemName: item.name,
        term: `${state.contractTerm}개월`,
        quantity: item.quantity,
        unit: "KG",
        listPrice: bean.price,
        discountPrice: discountedPrice,
      });
    });

    const beanSubtotalVatExcluded = beanLines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
    const beanSubtotalVatIncluded = beanSubtotalVatExcluded * (1 + vatRate);

    let shippingIncluded = false;
    if (state.beansEnabled && beanLines.length > 0) {
      if (state.shippingMode === "yes") {
        shippingIncluded = true;
      } else if (state.shippingMode === "auto") {
        shippingIncluded = beanSubtotalVatIncluded < data.constants.freeShippingThresholdVatIncluded;
      }
    }

    const shippingLine = shippingIncluded
      ? buildLineItem({
          type: "배송비",
          productName: "택배비",
          itemName: "택배비",
          term: `${state.contractTerm}개월`,
          quantity: 1,
          unit: "EA",
          listPrice: 0,
          discountPrice: data.constants.shippingFeeVatIncluded / (1 + vatRate),
        })
      : null;

    const purchaseLines = [];
    if (discountedPurchaseUnit != null) {
      purchaseLines.push(
        buildLineItem({
          type: "머신 구매",
          productName: state.machine.purchaseLabel,
          itemName: "머신 구매(AS/케어서비스 없음)",
          term: "-",
          quantity: state.machineQuantity,
          unit: "EA",
          listPrice: state.machine.purchasePrice,
          discountPrice: discountedPurchaseUnit,
        })
      );
    }
    if (state.purchaseInstall) {
      purchaseLines.push(
        buildLineItem({
          type: "설치비",
          productName: "설치 출장비",
          itemName: "머신 구매시 설치비 청구",
          term: "-",
          quantity: state.machineQuantity,
          unit: "EA",
          listPrice: data.constants.purchaseInstallFee,
          discountPrice: data.constants.purchaseInstallFee,
        })
      );
    }

    const rentalLines = [
      buildLineItem({
        type: "커피머신 단독",
        productName: state.machine.productName,
        itemName: state.machine.rentalItemName,
        term: `${state.contractTerm}개월`,
        quantity: state.machineQuantity,
        unit: "EA",
        listPrice: rentalUnit,
        discountPrice: discountedRentalUnit,
      }),
    ];

    const bundleLines = state.beansEnabled
      ? [
          buildLineItem({
            type: "커피머신 정기구독",
            productName: state.machine.productName,
            itemName: `${state.careCycle} 정기케어`,
            term: `${state.contractTerm}개월`,
            quantity: state.machineQuantity,
            unit: "EA",
            listPrice: bundleUnit,
            discountPrice: discountedBundleUnit,
          }),
          ...beanLines,
          ...(careLine ? [careLine] : []),
          ...(shippingLine ? [shippingLine] : []),
        ]
      : [];

    const purchaseSubtotal = purchaseLines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
    const rentalSubtotal = rentalLines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
    const bundleSubtotal = bundleLines.reduce((sum, line) => sum + (line.amount ?? 0), 0);

    return {
      ...state,
      validUntil,
      beanLines,
      shippingIncluded,
      purchaseLines,
      rentalLines,
      bundleLines,
      totals: {
        purchaseVatIncluded: purchaseLines.some((line) => line.amount == null) ? null : purchaseSubtotal * (1 + vatRate),
        rentalVatIncluded: rentalLines.some((line) => line.amount == null) ? null : rentalSubtotal * (1 + vatRate),
        bundleVatIncluded:
          bundleLines.length === 0 || bundleLines.some((line) => line.amount == null)
            ? null
            : bundleSubtotal * (1 + vatRate),
      },
    };
  }

  function renderPricingTable(lines) {
    return `
      <table class="pricing-table">
        <thead>
          <tr>
            <th>유형</th>
            <th>제품명</th>
            <th>품목명</th>
            <th>약정</th>
            <th class="money">수량</th>
            <th>단위</th>
            <th class="money">정가</th>
            <th class="money">할인 단가</th>
            <th class="money">금액</th>
          </tr>
        </thead>
        <tbody>
          ${lines
            .map(
              (line) => `
                <tr>
                  <td>${nl2br(line.type)}</td>
                  <td>${nl2br(line.productName)}</td>
                  <td>${nl2br(line.itemName)}</td>
                  <td>${escapeHtml(line.term)}</td>
                  <td class="money">${escapeHtml(line.quantity)}</td>
                  <td>${escapeHtml(line.unit)}</td>
                  <td class="money">${formatMoney(line.listPrice)}</td>
                  <td class="money">${formatMoney(line.discountPrice)}</td>
                  <td class="money">${formatMoney(line.amount)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function renderSectionCard(title, subtitle, total, lines, emptyMessage) {
    return `
      <section class="section-card">
        <div class="section-card-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(subtitle)}</p>
          </div>
          <div class="section-total">
            <small>총 월 납부금액 (VAT 포함)</small>
            <strong>${formatMoney(total)}</strong>
          </div>
        </div>
        ${lines.length ? renderPricingTable(lines) : `<div class="empty-state"><strong>${escapeHtml(emptyMessage)}</strong><small>원두 구성을 입력하면 이 섹션이 자동 계산됩니다.</small></div>`}
      </section>
    `;
  }

  function render() {
    const state = getFormState();
    const quote = computeQuote(state);

    document.body.className = state.theme === "blue" ? "theme-blue" : "";

    const notes = [
      `${data.constants.ownershipTransferMonths}개월 이상 이용 시 커피머신 소유권이 이전됩니다.`,
      "1년 무상 A/S 가능합니다. 단, 소비자 과실은 유상 청구될 수 있습니다.",
      "커피24 원두 미사용 또는 장기 미청소로 인한 고장은 유상 청구될 수 있습니다.",
      `케어주기 선택: ${quote.careCycle}`,
      quote.shippingIncluded
        ? "원두 금액이 5만원(VAT 포함) 미만이어서 택배비 3,500원(VAT 포함)이 반영되었습니다."
        : "원두 금액이 5만원(VAT 포함) 이상이거나 택배비 제외로 설정되어 배송비가 제외되었습니다.",
    ];

    preview.innerHTML = `
      <header class="quote-header">
        <div class="quote-title">
          <p class="eyebrow">Coffee24 Estimate</p>
          <h1>커피머신 정기구독 서비스 견적서</h1>
          <p>원본 ★26년 커피24_견적서_VAT별도.xlsx의 구성을 참고해 웹용 인쇄 레이아웃으로 재구성했습니다.</p>
        </div>
        <div class="brand-stamp">
          <strong>주식회사 위펀</strong>
          <span>대표자 김 헌<br />대표번호 1644-4624<br />대표메일 coffee24@snack24h.com</span>
        </div>
      </header>

      <section class="quote-meta">
        <div class="meta-table">
          <table>
            <tbody>
              <tr><th>견적일</th><td>${formatDate(quote.quoteDate)}</td><th>견적 유효일</th><td>${formatDate(quote.validUntil)}</td></tr>
              <tr><th>고객사명</th><td>${escapeHtml(quote.companyName)}</td><th>담당자</th><td>${escapeHtml(quote.contactName)}</td></tr>
              <tr><th>연락처</th><td>${escapeHtml(quote.contactPhone)}</td><th>이메일</th><td>${escapeHtml(quote.contactEmail)}</td></tr>
              <tr><th>영업담당자</th><td>${escapeHtml(quote.salesRep.name)}</td><th>담당자 연락처</th><td>${escapeHtml(quote.salesRep.phone)}</td></tr>
              <tr><th>담당자 이메일</th><td>${escapeHtml(quote.salesRep.email)}</td><th>약정 / 수량</th><td>${escapeHtml(`${quote.contractTerm}개월 / ${quote.machineQuantity}대`)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="meta-card">
          <h3>선택 요약</h3>
          <p class="chip">${escapeHtml(quote.machine.name)}</p>
          <p><strong>케어주기</strong><br />${escapeHtml(quote.careCycle)}</p>
          <p><strong>원두 포함</strong><br />${quote.beansEnabled ? "포함" : "미포함"}</p>
          <p><strong>할인율</strong><br />머신 ${Math.round(quote.machineDiscount * 100)}% / 원두 ${Math.round(
            quote.beanDiscount * 100
          )}%</p>
        </div>
      </section>

      <div class="summary-strip">
        <div>
          <small>추천안</small>
          <strong>${quote.beansEnabled ? "머신렌탈 & 원두구독" : "머신 단독 렌탈"}</strong>
        </div>
        <div>
          <small>VAT 포함 월 납부금액</small>
          <strong>${formatMoney(quote.beansEnabled ? quote.totals.bundleVatIncluded : quote.totals.rentalVatIncluded)}</strong>
        </div>
      </div>

      <div class="quote-grid">
        ${renderSectionCard(
          "머신 구매",
          "AS / 케어서비스 미포함 일시 구매안",
          quote.totals.purchaseVatIncluded,
          quote.purchaseLines,
          "정리본에 구매 단가가 없는 머신은 문의로 표시됩니다."
        )}
        ${renderSectionCard(
          "머신 단독 렌탈",
          "원두 미포함 월 렌탈안",
          quote.totals.rentalVatIncluded,
          quote.rentalLines,
          "해당 약정 조건의 단독 렌탈 단가가 없습니다."
        )}
        ${renderSectionCard(
          "머신렌탈 & 원두구독",
          "원두 포함 정기구독안",
          quote.totals.bundleVatIncluded,
          quote.bundleLines,
          "원두 포함을 활성화하고 원두 라인을 추가하면 계산됩니다."
        )}
      </div>

      <section class="section-card">
        <div class="section-card-head">
          <div>
            <h3>추가 구매 옵션</h3>
            <p>원본 견적서 하단 공통 옵션 영역을 반영했습니다.</p>
          </div>
          <div class="section-total">
            <small>공통 제공</small>
            <strong>0원</strong>
          </div>
        </div>
        <table class="pricing-table">
          <thead>
            <tr>
              <th>유형</th>
              <th>품목</th>
              <th>품목명</th>
              <th>조건</th>
              <th class="money">정가</th>
              <th class="money">월 부담금</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>무상제공</td><td>설치비</td><td>머신 설치 출장비</td><td>머신당 1EA</td><td class="money">${formatMoney(
              data.constants.setupVisitFee
            )}</td><td class="money">0원</td></tr>
            <tr><td>무상제공</td><td>설치비</td><td>머신 직수 설치비</td><td>필요시</td><td class="money">${formatMoney(
              data.constants.plumbInstallFee
            )}</td><td class="money">0원</td></tr>
            <tr><td>무상제공</td><td>부품</td><td>직수연결키트 (필터)</td><td>필요시</td><td class="money">${formatMoney(
              data.constants.plumbKitFee
            )}</td><td class="money">0원</td></tr>
          </tbody>
        </table>
      </section>

      <section class="note-spec-grid">
        <div class="note-card">
          <h3>공통 안내</h3>
          <ul class="note-list">
            ${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
            ${quote.machine.description
              .split("\n")
              .filter(Boolean)
              .map((line) => `<li>${escapeHtml(line.replace(/^\*\s*/, ""))}</li>`)
              .join("")}
          </ul>
        </div>
        <div class="spec-card">
          <h3>머신 스펙</h3>
          <ul class="spec-list">
            ${quote.machine.spec
              .split("\n")
              .filter(Boolean)
              .map((line) => `<li>${escapeHtml(line)}</li>`)
              .join("")}
          </ul>
        </div>
      </section>
    `;
  }

  function resetForm() {
    form.reset();
    quoteDateInput.value = todayInputValue();
    beanRows.innerHTML = "";
    createBeanRow("브라운스타", 1);
    render();
  }

  populateSelect(salesRepSelect, data.salesReps, (item) => ({ value: item.name, label: item.name }));
  populateSelect(machineSelect, data.machines, (item) => ({ value: item.name, label: item.name }));
  populateSelect(careSelect, data.careCycles, (item) => ({ value: item.cycle, label: item.cycle }));

  quoteDateInput.value = todayInputValue();
  salesRepSelect.value = "김서영";
  machineSelect.value = "TE-201U";
  careSelect.value = "4개월 1회";

  createBeanRow("브라운스타", 1);

  document.getElementById("add-bean-row").addEventListener("click", () => {
    createBeanRow(data.beans[0].name, 1);
    render();
  });
  document.getElementById("print-button").addEventListener("click", () => window.print());
  document.getElementById("reset-button").addEventListener("click", resetForm);
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  render();
})();
