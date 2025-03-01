import { useEffect, useState } from 'react';

const ShowPrimitives = ({ cyInstance }) => {
    const [showPrimitives, setShowPrimitives] = useState(false);
        useEffect(() => {
            if (!cyInstance) return;

            cyInstance.nodes().forEach((node) => {
                const nodeLabels = node.data("labels") || [];
                const shouldHide =
                    nodeLabels.includes("Primitive") || node.data("id") === "java.lang.String";

                if (shouldHide) {
                    node.style({
                        display: showPrimitives ? "element" : "none",
                    });
                }
            })
        }, [showPrimitives, cyInstance]);

    return (
        <label>
            <input
                type="checkbox"
                checked={showPrimitives}
                onChange={(e) => setShowPrimitives(e.target.checked)}
            />
            Show Primitive
        </label>
    );
};

export default ShowPrimitives;