import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_ID || "G-XXXXXXXXXX"; // Placeholder

export const initGA = () => {
    if (GA_ID && GA_ID !== "G-XXXXXXXXXX") {
        ReactGA.initialize(GA_ID);
        console.log("GA4 Initialized");
    }
};

export const trackPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category, action, label, value) => {
    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};

export const trackPurchase = (orderData) => {
    ReactGA.event("purchase", {
        transaction_id: orderData.paymentReference || orderData._id,
        value: orderData.totalAmount,
        currency: orderData.currency || "KES",
        items: orderData.products.map(p => ({
            item_id: p.product?._id || p.product,
            item_name: p.product?.name || "Product",
            quantity: p.quantity
        }))
    });
};
