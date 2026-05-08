# 커피24 견적서 생성기

정리본 `커피24 견적서 AX TF.xlsx`의 데이터 구조를 바탕으로, 원본 `★26년 커피24_견적서_VAT별도.xlsx` 레이아웃을 웹용으로 재구성한 정적 견적서 생성기입니다.

## 배포

GitHub Pages를 통해 자동으로 배포됩니다:
- **URL**: [https://choe1535-alt.github.io/estimate-coffee/](https://choe1535-alt.github.io/estimate-coffee/)
- **자동 배포**: `main` 브랜치에 `push`하면 GitHub Actions가 자동으로 사이트를 업데이트합니다.

## 파일

- `index.html`: 메인 화면
- `app/app.js`: 견적 계산 및 렌더링
- `app/styles.css`: 화면 / 인쇄 스타일
- `tools/build_data.py`: 엑셀 데이터에서 `app/data.js` 생성

## 실행

브라우저에서 `index.html`을 바로 열어도 되고, 로컬 서버로 띄워도 됩니다.

```bash
python3 -m http.server
```

그 다음 `http://localhost:8000`에서 확인하면 됩니다.

## 데이터 재생성

정리본 엑셀을 수정한 뒤에는 아래 명령으로 웹 데이터 파일을 다시 생성하세요.

```bash
python3 tools/build_data.py

```
