import st from './Settings.module.scss';

export default function Settings() {

    return (
        <div className={st.Con}>
            <div>How many Rounds?</div>
            <div>Time per Round?</div>
            <div>Auto Continue?</div>
            <div>Pictures?</div>
            <div>Pictures after time?</div>
            <div>Drinking Mode?</div>
            <div>Drinking Mode Difficulty</div>
        </div>
    );
}


