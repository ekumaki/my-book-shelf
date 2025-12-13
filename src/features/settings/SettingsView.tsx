import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Gear, DownloadSimple, UploadSimple, Trash } from '@phosphor-icons/react';
import { db } from '../../db/db';

export default function SettingsView() {
    const { themeId, setThemeId, availableThemes } = useTheme();

    const handleExport = async () => {
        const books = await db.books.toArray();
        const memos = await db.memos.toArray();
        const data = { books, memos, version: 1, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `book_knowledge_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!confirm('現在のデータは上書き・統合されます。よろしいですか？')) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                if (typeof event.target?.result !== 'string') return;
                const data = JSON.parse(event.target.result);
                if (data.books) await db.books.bulkPut(data.books);
                if (data.memos) await db.memos.bulkPut(data.memos);
                alert('インポートが完了しました');
            } catch (err) {
                alert('ファイル形式が正しくありません');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const handleReset = async () => {
        if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
            await db.delete();
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-20">
            <div className="p-4 bg-white shadow-sm sticky top-0 z-10 border-b">
                <h2 className="font-bold text-lg flex items-center justify-center gap-2 text-gray-700">
                    <Gear weight="fill" /> 設定
                </h2>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto flex-1">

                {/* Theme Settings */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3">本棚の背景テーマ</h3>
                    <div className="space-y-2">
                        {availableThemes.map(t => (
                            <label key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${themeId === t.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="theme"
                                    value={t.id}
                                    checked={themeId === t.id}
                                    onChange={() => setThemeId(t.id)}
                                    className="text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm font-bold text-gray-700">{t.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">データのバックアップ</h3>
                    <p className="text-xs text-gray-500 mb-4">機種変更時やデータの保全にご利用ください。</p>

                    <div className="space-y-3">
                        <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                            <DownloadSimple size={20} /> JSONを書き出し
                        </button>

                        <label className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-lg font-bold border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                            <UploadSimple size={20} /> データを読み込み
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
                    <h3 className="font-bold text-red-600 mb-2">危険な操作</h3>
                    <button onClick={handleReset} className="w-full text-red-500 py-2 rounded-lg font-bold hover:bg-red-50 text-sm border border-red-200 transition-colors flex items-center justify-center gap-2">
                        <Trash size={18} /> すべてのデータを削除 (初期化)
                    </button>
                </div>

                <div className="text-center text-xs text-gray-400 mt-8">
                    BookKnowledge v1.0<br />
                    Data is stored locally in your browser.
                </div>
            </div>
        </div>
    );
}
