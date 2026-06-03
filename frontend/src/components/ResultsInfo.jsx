export default function ResultsInfo({ pageInfo }) {
    if (!pageInfo) {
        return null;
    }

    return (
        <p className="mb-6 text-sm text-zinc-500">
            Wyniki: {pageInfo.totalElements}
        </p>
    );
}