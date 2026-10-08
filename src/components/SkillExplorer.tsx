import { useMemo, useState } from 'react';

const skillAreas = [
  {
    id: 'Statistics',
    score: 93,
    summary: 'Hypothesis testing, inference, forecasting, and decision-making under uncertainty.',
    stack: ['R', 'Python', 'SQL', 'Bayesian thinking'],
  },
  {
    id: 'ML',
    score: 88,
    summary: 'Modeling pipelines, evaluation, feature engineering, and reliable experimentation.',
    stack: ['Scikit-learn', 'PyTorch', 'XGBoost', 'MLOps'],
  },
  {
    id: 'Vision',
    score: 82,
    summary: 'Computer vision, robustness, representation learning, and visual perception workflows.',
    stack: ['OpenCV', 'CNNs', 'Image pipelines', 'Adversarial ML'],
  },
  {
    id: 'Research',
    score: 90,
    summary: 'Translating technical questions into experiments, visual explanations, and insight.',
    stack: ['Scientific writing', 'Visualization', 'Experimental design', 'Storytelling'],
  },
];

export default function SkillExplorer() {
  const [activeSkill, setActiveSkill] = useState('Statistics');

  const currentSkill = useMemo(
    () => skillAreas.find((item) => item.id === activeSkill) ?? skillAreas[0],
    [activeSkill],
  );

  return (
    <div className="skill-panel">
      <div className="skill-tabs" aria-label="Technical focus areas">
        {skillAreas.map((skill) => (
          <button
            key={skill.id}
            type="button"
            className={activeSkill === skill.id ? 'skill-tab active' : 'skill-tab'}
            onClick={() => setActiveSkill(skill.id)}
          >
            {skill.id}
          </button>
        ))}
      </div>

      <div className="skill-card">
        <div className="skill-header-row">
          <span className="pill">Focus area</span>
          <span className="score">{currentSkill.score}%</span>
        </div>

        <h3>{currentSkill.id}</h3>
        <p>{currentSkill.summary}</p>

        <div className="meter" aria-label={`${currentSkill.id} proficiency`}>
          <span style={{ width: `${currentSkill.score}%` }} />
        </div>

        <ul className="skill-tags">
          {currentSkill.stack.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
