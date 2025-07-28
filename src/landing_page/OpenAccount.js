import React from 'react';
function Hero() {
    return (
       
        <div className='container p-5 md-5'>
           {/* in one row there is 12 unit place so 3 col=4 unit space*/}
            <div className='row text-center'>
               {/* if image in scr folder then we have to import it but image is in public folder there is no need*/}
                <img src='media\image\homeHero.png' alt='Hero Image' className="mb-5" />
          <h1 className="mt-5">Open a Zerodha account</h1>
        <p>
           Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and
          F&O trades.
        </p>
        <button
          className="p-3 btn btn-primary fs-5 mb-5"
          style={{ width: "20%", margin: "0 auto" }}
        >
         Sign up Now
        </button>
        </div>
            


        </div>
    );
}

export default Hero;