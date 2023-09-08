import community from "../../../data/community.json";
const React = require('react');
import styles from './styles.module.css'

export default ({ badge }) => {

    let relevant = community
    	.flatMap(c => {
	        return (c.conformance ?? [])
	            .filter(i => i.src == badge)
	            .map(i => {
	                return {
	                    "conf": c,
	                    "badge": i
	                }
	            })
   		 });

    
	relevant = relevant.sort(function(a, b) {
		let x = a.conf.title.toLowerCase();
		let y = b.conf.title.toLowerCase();
		if (x < y) { return -1; }
		if (x > y) { return 1; }
		return 0;
	})


    return <div className={styles.conformanceShowcase}>
        {
            relevant.map((c, key) => {
                return (
                    <div className={styles.conformanceShowcaseItem} key={"conformance-item-" + key}>
                        <div className={styles.conformanceImage} key={key + "_1"}>
                            <img src={c.conf.image} alt={c.conf.title} title={c.conf.title} />
                        </div>
                        <div className={styles.conformanceText} key={key + "_2"}>
                            <a href={c.conf.infoLink}><div className="showcase-title">{c.conf.title}</div></a><ul>
                                {
                                    c.badge.items.map((item, key2) => {
                                        return (<li className={styles.conformanceItem} key={"conformance-item-" + key + "-badge" + key2}>
                                            <p>{item.text} {  (item.link) ? <em><a href={item.link}>More Details</a></em> :"" }</p>
                                        </li>)
                                    })
                                }
                            </ul>
                        </div>
                    </div>)
            })
        }

    </div>
}