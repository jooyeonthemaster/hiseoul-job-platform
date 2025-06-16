'use client';

import { useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentUpload';

interface UploadedDocument {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

export default function TestDocumentUploadPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleUploadSuccess = (document: UploadedDocument) => {
    setDocuments(prev => [...prev, document]);
    setMessage(`${document.fileName} 파일이 성공적으로 업로드되었습니다!`);
    setMessageType('success');
    
    // 3초 후 메시지 제거
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (error: string) => {
    setMessage(error);
    setMessageType('error');
    
    // 5초 후 메시지 제거
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRemoveDocument = (publicId: string) => {
    setDocuments(prev => prev.filter(doc => doc.publicId !== publicId));
    setMessage('문서가 목록에서 제거되었습니다.');
    setMessageType('success');
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            문서 업로드 테스트
          </h1>

          {/* 메시지 표시 */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* 업로드 섹션 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              새 문서 업로드 (클라이언트 직접 업로드)
            </h2>
            
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✨ <strong>새로운 업로드 방식:</strong> 파일이 서버를 거치지 않고 클라우디너리에 직접 업로드됩니다.
                <br />
                🚀 <strong>장점:</strong> Vercel 4.5MB 제한 없음, 더 빠른 업로드, 서버 부하 감소
              </p>
            </div>
            
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxSize={50} // 50MB로 증가 (Vercel 제한 없음)
              className="mb-4"
            />
            
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">지원되는 파일 형식:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>문서:</strong> PDF, DOC, DOCX, HWP, TXT, RTF</li>
                <li><strong>스프레드시트:</strong> XLS, XLSX</li>
                <li><strong>프레젠테이션:</strong> PPT, PPTX</li>
                <li><strong>압축파일:</strong> ZIP, RAR</li>
              </ul>
              <p className="mt-2 text-xs">
                * 최대 파일 크기: <strong>50MB</strong> (기존 20MB에서 증가!)<br />
                * 업로드된 파일은 클라우디너리에 직접 저장되며 다운로드 링크가 제공됩니다.<br />
                * <strong>Vercel 4.5MB 제한을 우회</strong>하여 큰 파일도 업로드 가능합니다.
              </p>
            </div>
          </div>

          {/* 업로드된 문서 목록 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              업로드된 문서 ({documents.length}개)
            </h2>
            <DocumentList 
              documents={documents} 
              onRemove={handleRemoveDocument}
            />
          </div>

          {/* 사용법 안내 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">사용법:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>위의 업로드 영역에 파일을 드래그하거나 클릭하여 파일을 선택하세요.</li>
              <li>지원되는 파일 형식인지 확인하고 업로드 버튼을 클릭하세요.</li>
              <li>업로드가 완료되면 아래 목록에 파일이 표시됩니다.</li>
              <li>다운로드 버튼을 클릭하면 파일을 다운로드할 수 있습니다.</li>
              <li>X 버튼을 클릭하면 목록에서 파일을 제거할 수 있습니다 (실제 파일은 클라우디너리에 남아있음).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 