import Content from "./content";
import { Suspense } from "react";

export default function App () {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Content />
        </Suspense>
    );
}