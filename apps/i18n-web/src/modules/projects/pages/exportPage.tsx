import { useState, useMemo } from 'react';
import { Button, Checkbox, Radio, Tag, message } from 'antd';
import { DownloadOutlined, FileTextOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAppStore } from '@/stores';
import { getLocaleLabel } from '@/contants';
import { exportJsonZipApi } from '@/api/export';

type FileFormat = 'json';

interface FormatOption {
  value: FileFormat;
  label: string;
  description: string;
  icon: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'json',
    label: 'JSON',
    description: '标准 JSON 格式，适用于大多数前端框架',
    icon: '{ }',
  },
];

export function ExportPage() {
  const { currentProject } = useAppStore();

  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('json');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(() => {
    const all = [
      currentProject?.sourceLocale,
      ...(currentProject?.targetLanguages || []),
    ].filter(Boolean) as string[];
    return all;
  });
  const [exporting, setExporting] = useState(false);

  const allLanguages = useMemo(() => {
    const source = currentProject?.sourceLocale;
    const targets = currentProject?.targetLanguages || [];
    if (!source) return [];
    return [source, ...targets];
  }, [currentProject]);

  const isAllSelected = selectedLangs.length === allLanguages.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedLangs([]);
    } else {
      setSelectedLangs([...allLanguages]);
    }
  };

  const handleToggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleExport = async () => {
    if (selectedLangs.length === 0) {
      message.warning('请至少选择一种语言');
      return;
    }
    setExporting(true);
    try {
      const response = await exportJsonZipApi(currentProject!.id);
      const blob = new Blob([response], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject!.slug}-translations.zip`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch {
      message.error('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* 文件格式 */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">文件格式</h2>
          <p className="text-sm text-slate-500 mb-4">选择导出的文件格式</p>
          <Radio.Group
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full"
          >
            <div className="grid grid-cols-1 gap-3">
              {FORMAT_OPTIONS.map((fmt) => (
                <label
                  key={fmt.value}
                  className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFormat === fmt.value
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <Radio value={fmt.value} className="!hidden" />
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="text-sm font-mono font-bold text-slate-600">{fmt.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-base">{fmt.label}</span>
                      {selectedFormat === fmt.value && (
                        <CheckCircleFilled className="text-blue-500 text-sm absolute right-8 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 m-0">{fmt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Radio.Group>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-sm text-slate-400">
            <FileTextOutlined className="mr-1" />
            导出为 <span className="font-medium text-slate-600">.{selectedFormat}</span> 文件
          </span>
        </div>
      </div>

      {/* 语种选择 */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">选择语种</h2>
          <p className="text-sm text-slate-500 mb-4">选择需要导出的语言，默认导出所有语种</p>

          <div className="mb-3">
            <Checkbox
              checked={isAllSelected}
              indeterminate={selectedLangs.length > 0 && !isAllSelected}
              onChange={handleToggleAll}
            >
              <span className="text-sm font-medium text-slate-700">全选</span>
            </Checkbox>
          </div>

          <div className="flex flex-wrap gap-2">
            {allLanguages.map((lang) => {
              const isSelected = selectedLangs.includes(lang);
              const isSource = lang === currentProject?.sourceLocale;
              return (
                <Tag
                  key={lang}
                  className={`cursor-pointer select-none px-3 py-1 text-sm rounded-md border transition-all ${isSelected
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  onClick={() => handleToggleLang(lang)}
                >
                  {isSelected && <CheckCircleFilled className="mr-1 text-xs" />}
                  {getLocaleLabel(lang)} ({lang})
                  {isSource && (
                    <span className="ml-1 text-xs opacity-60">· 源语言</span>
                  )}
                </Tag>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-sm text-slate-400">
            已选择 <span className="font-medium text-slate-600">{selectedLangs.length}</span> / {allLanguages.length} 种语言
          </span>
        </div>
      </div>

      {/* 导出操作 */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">导出翻译</h2>
          <p className="text-sm text-slate-500 mb-1">
            将 <span className="font-medium text-slate-700">{selectedLangs.length}</span> 种语言的翻译内容导出为{' '}
            <span className="font-medium text-slate-700">.{selectedFormat}</span> 格式文件
          </p>
          <p className="text-sm text-slate-400">
            每种语言将生成独立文件，打包为 ZIP 下载
          </p>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            共 {currentProject?.keyCount || 0} 个 Key
          </span>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exporting}
            disabled={selectedLangs.length === 0}
            onClick={handleExport}
            size="large"
          >
            导出文件
          </Button>
        </div>
      </div>
    </div>
  );
}
