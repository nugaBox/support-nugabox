import {
  createAttachmentDisposition,
  normalizeAttachmentFileName,
} from './attachment-filename';

describe('attachment filename helpers', () => {
  it('Multer가 Latin-1로 넘긴 UTF-8 한국어 파일명을 복원한다', () => {
    const mojibake = Buffer.from('한글 파일.pdf', 'utf8').toString('latin1');

    expect(normalizeAttachmentFileName(mojibake)).toBe('한글 파일.pdf');
  });

  it('이미 정상인 한국어 파일명은 그대로 유지한다', () => {
    expect(normalizeAttachmentFileName('요청서_최종.xlsx')).toBe('요청서_최종.xlsx');
  });

  it('파일명에서 경로 조각과 제어 문자를 제거한다', () => {
    expect(normalizeAttachmentFileName('C:\\fakepath\\보고서\r\n.pdf')).toBe(
      '보고서.pdf',
    );
  });

  it('다운로드 헤더에 ASCII fallback과 UTF-8 filename*을 함께 넣는다', () => {
    expect(createAttachmentDisposition('한글 파일.pdf')).toBe(
      'attachment; filename="__ __.pdf"; filename*=UTF-8\'\'%ED%95%9C%EA%B8%80%20%ED%8C%8C%EC%9D%BC.pdf',
    );
  });
});
