import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neutral-900 mb-6">GitHub 릴리즈 통계 플랫폼</h1>
      <p className="text-xl text-neutral-600 mb-8">
        개발자와 팀을 위한 포괄적인 GitHub 릴리즈 모니터링 및 분석 도구입니다.
        실시간 통계와 인사이트를 확인하세요.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/dashboard" className="btn btn-primary">
          대시보드 바로가기
        </Link>
        <Link to="/analytics" className="btn btn-primary">
          고급 분석 도구
        </Link>
        <a
          href="https://github.com/migusdn/migusdn-Solvr-Q7"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          GitHub 프로젝트
        </a>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">실시간 릴리즈 모니터링</h2>
          <p className="text-neutral-600">
            GitHub 저장소의 모든 릴리즈 활동을 실시간으로 추적하고 시각화된 데이터로 확인하세요.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">릴리즈 타입 분석</h2>
          <p className="text-neutral-600">
            정식 릴리즈와 프리릴리즈 비율을 분석하여 프로젝트의 안정성과 개발 주기를 평가합니다.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">다중 저장소 통합</h2>
          <p className="text-neutral-600">
            여러 GitHub 저장소의 릴리즈 통계를 하나의 대시보드에서 종합적으로 관리하고 비교합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
