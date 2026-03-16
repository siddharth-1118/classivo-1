"use server";
import { PaymentUserInfo } from "../../Types/payment";

export async function createPaymentLink(userInfo: PaymentUserInfo) {
  try {
    const myHeaders = new Headers();
    const authString = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Basic ${authString}`);

    const raw = JSON.stringify({
      upi_link: "true",
      amount: 2000,
      currency: "INR",
      accept_partial: false,
      description: "Classivo Subscription",
      customer: {
        name: userInfo.name,
        contact: userInfo.contact,
        email: userInfo.email,
      },
      callback_url: "https://Classivo123.vercel.app/app/dashboard",
      callback_method: "get",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const res = await fetch(
      "https://api.razorpay.com/v1/payment_links",
      requestOptions
    ).then((response) => response.json());

    return res.short_url;
  } catch (error) {
    console.log(error);
  }
}

