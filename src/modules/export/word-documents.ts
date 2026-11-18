import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import JSZip from 'jszip';
import { missing, type DocumentData } from './document-data.js';

const wordNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
type Row = Array<string | number>;
type Block = string | { title: string } | { headers: string[]; rows: Row[] } | { original: number };
type WordTemplate = (data: DocumentData) => Block[];

const field = (label: string, value?: string | number) => `${label}: ${value || missing(label.toLowerCase())}`;
const title = (value: string) => ({ title: value });
const table = (headers: string[], rows: Row[]) => ({ headers, rows });

function groupDetails(data: DocumentData): Block[] {
  return [
    field('Группа', data.groupName), field('Специальность', data.specialty),
    field('Квалификация', data.qualification), field('Семестр', data.semesterName),
  ];
}

function studentRows(data: DocumentData, values: Row): Row[] {
  const rows = data.students.map((student, index) => [index + 1, student.name, ...values]);
  if (!data.hasEnrollment) rows.push(['', missing('полный состав группы на семестр'), ...values]);
  return rows;
}

function commissionLine(data: DocumentData) {
  return field('Состав комиссии', data.commission.map(({ role, fullName, position }) =>
    [role, fullName, position].filter(Boolean).join(' — ')).join('; '));
}

function practiceDetails(data: DocumentData): Block[] {
  return [
    ...groupDetails(data), field('Вид и тип практики'), field('Индекс и наименование практики', data.discipline),
    field('Профильная организация'), field('Период прохождения'), field('Объём практики, часов'),
    field('Руководитель от колледжа'), field('Руководитель от профильной организации'),
  ];
}

const practiceStudent = (data: DocumentData) => field('Обучающийся', data.student);

export const wordTemplates = {
  'practice-calendar': (data) => [
    field('Утверждение'), title('График реализации программ практик'), ...groupDetails(data),
    field('Учебный год', data.academicYear),
    table(['Группа', 'Наименование производственной практики', 'Сроки прохождения'], [[
      data.groupName ?? missing('группа'), data.discipline ?? missing('индекс и наименование практики'),
      missing('сроки и продолжительность'),
    ]]),
    field('Руководитель кафедры'), field('Согласование'),
  ],
  'practice-contract': (data) => [
    title('Договор на производственную практику'), field('Номер и дата договора'), 'г. Москва',
    'Стороны договора: АНО ПО «ИТ ХАБ» и профильная организация.',
    field('Представитель колледжа'), field('Организация, представитель и основания полномочий'),
    ...groupDetails(data), field('Производственная практика', data.discipline), field('Период прохождения'),
    ...[5, 7, 8, 10, 11].map((original) => ({ original })),
    '2.1 Предоставить студентам колледжа прохождение производственной практики по указанной программе и в указанный период.',
    '2.2 Форма прохождения практики определяется сторонами.',
    field('Форма прохождения практики'),
    ...[15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28].map((original) => ({ original })),
    'Колледж контролирует участие обучающихся в мероприятиях практики.',
    ...[30, 31, 32, 33, 34, 36, 37, 38].map((original) => ({ original })),
    field('Дата окончания действия договора'), { original: 40 },
    field('Реквизиты сторон'), field('Подписи сторон'), missing('согласованный текст договора для подписания'),
  ],
  'module-admission': (data) => [
    title('Ведомость допуска студентов к экзамену по модулю'), ...groupDetails(data),
    field('Профессиональный модуль', data.discipline), field('Дата оформления'),
    table(['№', 'ФИО студента', 'Результаты МДК, УП и ПП', 'Отметка о допуске'],
      studentRows(data, [missing('состав модуля и оценки'), missing('статус допуска')])),
    commissionLine(data), field('Заместитель директора по учебно-методической работе'),
  ],
  'project-order': (data) => [
    title('Приказ о закреплении тем и защите курсовых проектов'), field('Номер и дата приказа'), 'г. Москва',
    ...groupDetails(data), field('Дисциплина или модуль', data.discipline), title('Приказываю'),
    'Утвердить темы и руководителей курсовых проектов согласно приложению.',
    field('Дата защиты'), field('Ответственный за исполнение'), field('Директор'), title('Приложение'),
    table(['№', 'ФИО студента', 'Тема курсового проекта', 'Руководитель'],
      studentRows(data, [missing('тема'), missing('руководитель')])),
  ],
  'commission-order': (data) => [
    title('Приказ об утверждении состава экзаменационной комиссии'), field('Номер и дата приказа'), 'г. Москва',
    ...groupDetails(data), field('Курс', data.course), field('Форма обучения'),
    field('Профессиональный модуль', data.discipline), field('Дата экзамена'), title('Приказываю'),
    'Утвердить состав экзаменационной комиссии по указанному модулю.',
    table(['Роль в комиссии', 'ФИО', 'Должность'], data.commission.length
      ? data.commission.map(({ role, fullName, position }) => [role, fullName, position ?? missing('должность')])
      : [[missing('роль'), missing('ФИО'), missing('должность')]]),
    field('Директор'), field('Проект приказа вносит'), title('Лист ознакомления'),
    table(['№', 'ФИО', 'Дата ознакомления', 'Подпись'], data.commission.length
      ? data.commission.map(({ fullName }, index) => [index + 1, fullName, '', ''])
      : [['', missing('состав комиссии'), '', '']]),
  ],
  'department-minutes': (data) => [
    title('Протокол заседания кафедры'), field('Номер и дата протокола'), field('Кафедра'),
    field('Специальность', data.specialty), field('Квалификация', data.qualification),
    field('Руководитель кафедры'), field('Присутствовали'), field('Повестка'),
    field('Рассмотренные материалы'), field('Результаты голосования'), field('Решения'), field('Подпись'),
  ],
  'project-schedule': (data) => [
    title('Расписание защит курсовых проектов'), ...groupDetails(data), field('Учебный год', data.academicYear),
    table(['Группа', 'Дата защиты', 'Время', 'Аудитория'], [[
      data.groupName ?? missing('группа'), missing('дата'), missing('время'), missing('аудитория'),
    ]]), field('Согласование с руководителем кафедры'),
  ],
  'assessment-schedule': (data) => [
    title('Расписание промежуточной аттестации'), ...groupDetails(data), field('Дата утверждения'),
    missing('учебный план и перечень экзаменов для группы'),
    table(['Дисциплина', 'Аттестующий преподаватель', 'Консультация', 'Экзамен', 'Аудитория'], [[
      data.discipline ?? missing('дисциплина'), missing('назначенный преподаватель'),
      missing('дата консультации'), missing('дата экзамена'), missing('аудитория'),
    ]]), field('Согласование'), field('Утверждение'),
  ],
  'module-summary': (data) => [
    title('Сводная ведомость экзамена по профессиональному модулю'), ...groupDetails(data),
    field('Профессиональный модуль', data.discipline), field('Часы по учебному плану'),
    field('Курс', data.course), field('Дата экзамена'),
    table(['№', 'ФИО студента', 'МДК, УП и ПП', 'Экзамен по модулю', 'Итог по ПМ'],
      studentRows(data, [missing('состав модуля и оценки'), missing('оценка за экзамен'), missing('итог по ПМ')])),
    commissionLine(data), field('Заместитель директора по учебно-методической работе'),
  ],
  'practice-assessment': (data) => [
    title('Аттестационный лист по практике'), practiceStudent(data), ...practiceDetails(data),
    field('Курс', data.course),
    table(['Индекс ПК', 'Наименование профессиональной компетенции', 'Оценка'], [[
      missing('индекс'), missing('компетенция'), missing('оценка'),
    ]]),
    field('Теоретическая подготовка'), field('Дисциплина и соблюдение техники безопасности'),
    field('Оценка руководителя организации'), field('Оценка отчётных документов'),
    field('Итоговая оценка по практике'), field('Дата и подписи руководителей'),
  ],
  'library-access': (data) => [
    title('Ведомость выдачи доступа к электронной библиотеке'), field('Учебный год', data.academicYear),
    ...groupDetails(data),
    table(['№', 'ФИО студента', 'Группа', 'Логин Юрайт', 'Подпись студента'],
      studentRows(data, [data.groupName ?? missing('группа'), missing('логин Юрайт'), ''])),
  ],
  'practice-diary': (data) => [
    title('Дневник по производственной практике'), practiceStudent(data), ...practiceDetails(data),
    field('Учебный год', data.academicYear), field('Адрес профильной организации'),
    title('Программа практики'), field('Общие и профессиональные компетенции'),
    table(['Вид работ', 'Коды ОК и ПК', 'Часы'], [[missing('задание'), missing('коды'), missing('часы')]]),
    title('Учёт прохождения практики'),
    table(['Дата', 'Выполненные работы', 'Часы', 'Оценка', 'Подпись руководителя'], [[
      missing('дата'), missing('выполненные работы'), missing('часы'), missing('оценка'), '',
    ]]), field('Подписи руководителей и обучающегося'),
  ],
  'course-project': (data) => [
    title('Курсовой проект'), field('Тема'), field('Обучающийся', data.student), ...groupDetails(data),
    field('Курс', data.course), field('Руководитель проекта'), field('Учебный год', data.academicYear),
    title('Задание на курсовой проект'), field('Вопросы к рассмотрению'), field('Источники и литература'),
    field('Дата выдачи задания'), field('Срок сдачи'), field('Подписи студента и руководителя'),
    title('Содержание'), missing('текст курсового проекта'),
  ],
  'practice-report': (data) => [
    title('Отчёт по учебной или производственной практике'), practiceStudent(data), ...practiceDetails(data),
    field('Оценка по практике'), field('Подпись руководителя от колледжа'),
    title('Содержание отчёта'), field('Характеристика профильной организации'), field('Обязанности и задачи'),
    field('Документы и материалы'), field('Отчёт о выполнении заданий'), field('Выводы'), field('Приложения'),
    field('Дата составления и подпись обучающегося'),
  ],
  'practice-order': (data) => [
    title('Приказ о направлении на производственную практику'), field('Номер и дата приказа'), 'г. Москва',
    ...groupDetails(data), field('Учебный год', data.academicYear),
    title('Приказываю'), 'Направить обучающихся на производственную практику.',
    field('Вид деятельности', data.discipline), field('Сроки прохождения'), field('Продолжительность в часах'),
    table(['№', 'ФИО студента', 'Профильная организация'], studentRows(data, [missing('организация прохождения практики')])),
    field('Руководитель практики от колледжа'),
    ...[19, 20, 21, 22].map((original) => ({ original })),
    field('Ответственный за исполнение приказа'), field('Директор'),
  ],
} satisfies Record<string, WordTemplate>;

function escapeXml(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function paragraph(value: string, heading = false) {
  const layout = heading ? '<w:pPr><w:keepNext/><w:spacing w:before="180" w:after="110"/></w:pPr>' :
    '<w:pPr><w:spacing w:after="85"/></w:pPr>';
  const font = heading ? '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr>' : '<w:rPr><w:sz w:val="22"/></w:rPr>';
  return `<w:p>${layout}<w:r>${font}<w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r></w:p>`;
}

function renderTable(headers: string[], rows: Row[]) {
  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((edge) => `<w:${edge} w:val="single" w:sz="5" w:color="888888"/>`).join('');
  const weights = headers.map((header) => header === '№' ? 0.5 : header.startsWith('ФИО') ? 2 : 1.5);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const renderRow = (cells: Row, header: boolean) => `<w:tr>${header ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cells.map((value, index) =>
    `<w:tc><w:tcPr><w:tcW w:w="${Math.round(5000 * weights[index]! / totalWeight)}" w:type="pct"/></w:tcPr>${paragraph(String(value))}</w:tc>`).join('')}</w:tr>`;
  return [
    '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>',
    `<w:tblBorders>${borders}</w:tblBorders></w:tblPr>`,
    `<w:tblGrid>${weights.map((weight) => `<w:gridCol w:w="${Math.round(9000 * weight / totalWeight)}"/>`).join('')}</w:tblGrid>`,
    renderRow(headers, true), ...rows.map((row) => renderRow(row, false)), '</w:tbl>',
  ].join('');
}

export async function renderWord(template: Buffer, key: keyof typeof wordTemplates, data: DocumentData) {
  const zip = await JSZip.loadAsync(template);
  const main = zip.file('word/document.xml');
  if (!main) throw new Error('В Word-шаблоне отсутствует основной документ');
  const parser = new DOMParser();
  const document = parser.parseFromString(await main.async('string'), 'application/xml');
  const body = document.getElementsByTagNameNS(wordNamespace, 'body').item(0);
  if (!body) throw new Error('В Word-шаблоне отсутствует содержимое');
  const children = Array.from(body.childNodes);
  const paragraphs = children.filter((child) => child.nodeName === 'w:p');
  const section = children.find((child) => child.nodeName === 'w:sectPr');
  const firstTable = children.find((child) => child.nodeName === 'w:tbl');
  const letterhead = key !== 'practice-contract' && firstTable?.textContent?.includes('АНО ПО') ? firstTable : undefined;
  while (body.firstChild) body.removeChild(body.firstChild);
  if (letterhead) body.appendChild(letterhead);
  const blocks = wordTemplates[key](data);
  for (const block of blocks) {
    if (typeof block !== 'string' && 'original' in block) {
      const original = paragraphs[block.original];
      if (!original) throw new Error('Структура Word-шаблона изменилась');
      body.appendChild(original);
      continue;
    }
    const xml = typeof block === 'string' ? paragraph(block) :
      'title' in block ? paragraph(block.title, true) : renderTable(block.headers, block.rows);
    const element = parser.parseFromString(`<root xmlns:w="${wordNamespace}">${xml}</root>`, 'application/xml')
      .documentElement?.firstChild;
    if (!element) throw new Error('Не удалось сформировать блок Word');
    body.appendChild(document.importNode(element, true));
  }
  if (section) body.appendChild(section);
  zip.file('word/document.xml', new XMLSerializer().serializeToString(document));
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
