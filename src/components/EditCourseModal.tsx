import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Course } from "../types/courses.types";

export default function EditCourseModal({
  isOpen,
  onClose,
  courseId,
  refetchCourses,
}: {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  refetchCourses: () => Promise<void>;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [courseBanner, setCourseBanner] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles(Array.from(e.target.files));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseBanner(e.target.files[0]);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("course[title]", title || course?.title || "");
      formData.append(
        "course[description]",
        description || course?.description || ""
      );
      formData.append("course[end_date]", endDate || course?.end_date || "");
      formData.append("course[updated_at]", new Date().toISOString());

      if (courseBanner) {
        formData.append("course[course_banner]", courseBanner);
      }

      videoFiles.forEach((file, index) => {
        formData.append(
          `course[course_files_attributes][${index}][name]`,
          file.name
        );
        formData.append(
          `course[course_files_attributes][${index}][file]`,
          file
        );
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to update course");

      refetchCourses();
      onClose();

      toast({
        title: "Curso atualizado.",
        description: "O curso foi atualizado com sucesso!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o curso.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/courses/${courseId}`
        );
        if (!res.ok) throw new Error("Failed to fetch course");
        const data: Course = await res.json();
        setCourse(data);
      } catch (err) {
        toast({
          title: "Erro",
          description: "Falha ao carregar o curso.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      fetchCourse();
    }
  }, [isOpen, courseId, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader mt={4}>Editar curso</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Título</FormLabel>
            <Input
              onChange={(e) => setTitle(e.target.value)}
              defaultValue={course?.title}
              placeholder="Título"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Descrição</FormLabel>
            <Input
              onChange={(e) => setDescription(e.target.value)}
              defaultValue={course?.description}
              placeholder="Descrição"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Data de Término</FormLabel>
            <Input
              onChange={(e) => setEndDate(e.target.value)}
              defaultValue={course?.end_date}
              type="date"
              placeholder="Data de Término"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Upload de Novo Banner</FormLabel>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleBannerChange}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Upload de Novos Vídeos</FormLabel>
            <Input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleUpdateCourse}
            colorScheme="blue"
            mr={3}
            disabled={isLoading}
          >
            Salvar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
