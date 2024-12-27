export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <h1>그룹 생성</h1>
      </header>
      {children}
    </>
  );
}
