const AVATAR_COLORS = ["#FF6B9D", "#4D9FFF", "#0c6055", "#FFB347", "#9B59B6"];

function getInitial(name) {
    if (!name || typeof name !== "string") return "?";
    return name.trim().charAt(0) || "?";
}

export default function NameAvatarStack({ names = [] }) {
    const list = names.filter(Boolean);
    if (list.length === 0) return <span className="text-black text-lg font-semibold">—</span>;

    return (
        <div className="flex flex-col gap-2.5 w-full min-w-0">
            <div className="flex items-center justify-start">
                {list.slice(0, 6).map((name, index) => (
                    <div
                        key={`${name}-${index}`}
                        title={name}
                        className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-11 font-bold shrink-0 -ms-2 first:ms-0"
                        style={{
                            backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                            zIndex: list.length - index,
                        }}
                    >
                        {getInitial(name)}
                    </div>
                ))}
            </div>
            <p className="text-13 font-medium text-black leading-relaxed">{list.join("، ")}</p>
        </div>
    );
}
