"use client";

import { useEffect, useState } from "react";
import type { Customer } from "@/types/Customer";
import type { Reservation } from "@/types/Reservation";
import {
  fetchAnonymizationReviews,
  saveAnonymizationReview,
} from "@/utils/customerAnonymizationApi";
import {
  getAnonymizationCandidates,
  type AnonymizationCandidate,
} from "@/utils/customerAnonymization";

type Props = {
  customers: Customer[];
  reservations: Reservation[];
  onBack: () => void;
};

export default function CustomerAnonymizationManagement({
  customers,
  reservations,
  onBack,
}: Props) {
  const [candidates, setCandidates] = useState<
    AnonymizationCandidate[]
  >([]);
  const [unreviewedCount, setUnreviewedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const currentCandidates = getAnonymizationCandidates(
          customers,
          reservations
        );

        const reviews = await fetchAnonymizationReviews();

        // 前回確認した最終来店日と比較して未確認候補を判定
        const unreviewed = currentCandidates.filter((candidate) => {
          const review = reviews.find(
            (item) => item.customerId === candidate.customer.id
          );

          return (
            !review ||
            candidate.lastVisit > review.reviewedLastVisit
          );
        });

        setCandidates(currentCandidates);
        setUnreviewedCount(unreviewed.length);

        // 現在の候補を確認済みとして保存
        for (const candidate of currentCandidates) {
          await saveAnonymizationReview(
            candidate.customer.id,
            candidate.lastVisit
          );
        }
      } catch (err) {
        console.error("匿名化候補の取得に失敗しました", err);
        setError("候補の取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [customers, reservations]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          顧客データ管理
        </h2>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          戻る
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">匿名化候補</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {candidates.length}人
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">今回の未確認候補</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {unreviewedCount}人
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        最終来店から3年以上経過した顧客を表示しています。
        この画面を開くと、表示された候補は確認済みとして記録されます。
        自動で匿名化されることはありません。
      </div>

      {loading ? (
        <p className="py-10 text-center text-slate-500">
          読み込み中...
        </p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : candidates.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          現在、匿名化候補の顧客はいません。
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {candidates.map((candidate) => (
            <div
              key={candidate.customer.id}
              className="flex items-center justify-between border-b border-slate-100 p-4 last:border-b-0"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {candidate.customer.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  最終来店日：{candidate.lastVisit}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}