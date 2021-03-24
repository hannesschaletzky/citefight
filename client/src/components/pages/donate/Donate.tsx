import st from './Donate.module.scss';

export default function DonationThankYou() {

    return (
        <div className={st.Con}>
            <div className={st.Caption}>
                Thank you for cosindering a donation! <br></br> This helps me to provide a nice game experience :) 
            </div>
            <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="YUAZQEBXR7AU2" />
            <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
            </form>
        </div>
    )
}








